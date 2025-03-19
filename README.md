Support has been added to build windows applications but you will need to add the support first with:
  sudo pacman -S mingw-w64-gcc
  rustup target add x86_64-pc-windows-gnu

For Web output you must add web support to the computer before you can build it with:
  rustup target add wasm32-unknown-unknown

NOTE: This is different then adding web-support to the program.  This needs to be done once on the PC where the command in the VS code extension must be done for each program.
