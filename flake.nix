{
  description = "LibreScope — explore the open-source ecosystem as a graph";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});

      # The app is a static site: Vite compiles it to plain files in `dist/`.
      # `importNpmLock` reads package-lock.json, so there is no npmDepsHash to
      # recompute every time dependencies move.
      mkLibrescope =
        pkgs:
        pkgs.buildNpmPackage {
          pname = "librescope";
          version = "0.1.0";
          src = self;

          npmDeps = pkgs.importNpmLock { npmRoot = self; };
          npmConfigHook = pkgs.importNpmLock.npmConfigHook;

          installPhase = ''
            runHook preInstall
            mkdir -p $out/share/librescope
            cp -r dist/. $out/share/librescope/
            runHook postInstall
          '';

          meta = {
            description = "Explore the open-source ecosystem as a node graph";
            license = nixpkgs.lib.licenses.mit;
            platforms = nixpkgs.lib.platforms.all;
          };
        };
    in
    {
      packages = forAllSystems (pkgs: rec {
        librescope = mkLibrescope pkgs;
        default = librescope;
      });

      # `nix develop` drops you into a shell with Node and npm ready:
      #   npm install && npm run dev
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [ pkgs.nodejs_24 ];

          shellHook = ''
            echo "LibreScope dev shell"
            echo "  npm install   # first run only"
            echo "  npm run dev   # http://localhost:5173"
          '';
        };
      });

      # A deliberately small module: it serves the built site on one port and
      # nothing else. Public-facing nginx stays yours to write, e.g.
      #
      #   services.librescope = {
      #     enable = true;
      #     port = 5555;
      #   };
      #
      #   services.nginx.virtualHosts."scope.example.com" = {
      #     enableACME = true;
      #     forceSSL = true;
      #     locations."/".proxyPass = "http://127.0.0.1:5555";
      #   };
      nixosModules.librescope =
        { config, lib, pkgs, ... }:
        let
          cfg = config.services.librescope;
        in
        {
          options.services.librescope = {
            enable = lib.mkEnableOption "the LibreScope web app";

            port = lib.mkOption {
              type = lib.types.port;
              default = 5555;
              description = ''
                Port the app serves on. It binds to 127.0.0.1 only, so the port is
                never reachable from outside — point your own nginx vhost at it.
              '';
            };
          };

          config = lib.mkIf cfg.enable {
            services.nginx = {
              enable = true;
              virtualHosts."librescope" = {
                listen = [
                  {
                    addr = "127.0.0.1";
                    port = cfg.port;
                  }
                ];
                root = "${self.packages.${pkgs.stdenv.hostPlatform.system}.librescope}/share/librescope";
              };
            };
          };
        };

      nixosModules.default = self.nixosModules.librescope;
    };
}
