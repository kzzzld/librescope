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
    in
    {
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
    };
}
