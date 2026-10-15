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
      #
      # or, for a public domain with a Let's Encrypt certificate:
      #
      #   services.librescope.hostName = "librescope.example.com";
      #   services.librescope.enableACME = true;
      #   services.librescope.forceSSL = true;
      nixosModules.librescope =
        { config, lib, pkgs, ... }:
        let
          cfg = config.services.librescope;

          # With ACME we deliberately leave `listen` alone: the nginx module then
          # derives the listeners itself, which is what the ACME machinery needs
          # (port 80 for the challenge, 443 for the site). Without ACME we pick
          # the port ourselves.
          vhostName = if cfg.hostName != null then cfg.hostName else "librescope";
        in
        {
          options.services.librescope = {
            enable = lib.mkEnableOption "the LibreScope web app";

            package = lib.mkOption {
              type = lib.types.package;
              default = self.packages.${pkgs.stdenv.hostPlatform.system}.librescope;
              description = "The LibreScope build to serve.";
            };

            hostName = lib.mkOption {
              type = lib.types.nullOr lib.types.str;
              default = null;
              example = "librescope.example.com";
              description = ''
                Domain to serve. When left null the site answers on any host name
                at {option}`services.librescope.port`.
              '';
            };

            port = lib.mkOption {
              type = lib.types.port;
              default = 5555;
              description = ''
                Port the web server listens on. Ignored when
                {option}`services.librescope.enableACME` is set, because ACME runs
                over the standard ports 80 and 443.
              '';
            };

            enableACME = lib.mkOption {
              type = lib.types.bool;
              default = false;
              description = ''
                Ask Let's Encrypt for a certificate for
                {option}`services.librescope.hostName` and serve the site over
                HTTPS. Requires `security.acme.acceptTerms = true;` in the system
                configuration.
              '';
            };

            forceSSL = lib.mkOption {
              type = lib.types.bool;
              default = false;
              description = ''
                Redirect plain HTTP to HTTPS. Usually set alongside
                {option}`services.librescope.enableACME`.
              '';
            };

            openFirewall = lib.mkOption {
              type = lib.types.bool;
              default = false;
              description = ''
                Open {option}`services.librescope.port` in the firewall. Ports 80
                and 443 are opened automatically when
                {option}`services.librescope.enableACME` is set.
              '';
            };
          };

          config = lib.mkIf cfg.enable {
            assertions = [
              {
                assertion = !cfg.enableACME || cfg.hostName != null;
                message = "services.librescope.enableACME requires services.librescope.hostName to be set.";
              }
            ];

            services.nginx = {
              enable = true;
              virtualHosts.${vhostName} = {
                inherit (cfg) enableACME forceSSL;
                root = "${cfg.package}/share/librescope";
              } // lib.optionalAttrs (!cfg.enableACME) {
                listen = [
                  {
                    addr = "0.0.0.0";
                    port = cfg.port;
                  }
                ];
              };
            };

            networking.firewall.allowedTCPPorts =
              lib.optionals cfg.openFirewall [ cfg.port ] ++ lib.optionals cfg.enableACME [ 80 443 ];
          };
        };

      nixosModules.default = self.nixosModules.librescope;
    };
}
