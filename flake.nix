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

      # Serve the built site with nginx:
      #
      #   services.librescope.enable = true;
      #   services.librescope.port = 5555;
      nixosModules.librescope =
        { config, lib, pkgs, ... }:
        let
          cfg = config.services.librescope;
        in
        {
          options.services.librescope = {
            enable = lib.mkEnableOption "the LibreScope web app";

            package = lib.mkOption {
              type = lib.types.package;
              default = self.packages.${pkgs.stdenv.hostPlatform.system}.librescope;
              description = "The LibreScope build to serve.";
            };

            port = lib.mkOption {
              type = lib.types.port;
              default = 5555;
              description = "Port the web server listens on.";
            };

            openFirewall = lib.mkOption {
              type = lib.types.bool;
              default = false;
              description = "Whether to open {option}`services.librescope.port` in the firewall.";
            };
          };

          config = lib.mkIf cfg.enable {
            services.nginx = {
              enable = true;
              virtualHosts."librescope" = {
                listen = [
                  {
                    addr = "0.0.0.0";
                    port = cfg.port;
                  }
                ];
                root = "${cfg.package}/share/librescope";
              };
            };

            networking.firewall.allowedTCPPorts = lib.mkIf cfg.openFirewall [ cfg.port ];
          };
        };

      nixosModules.default = self.nixosModules.librescope;
    };
}
