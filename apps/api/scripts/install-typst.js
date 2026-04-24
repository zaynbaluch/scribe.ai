const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TYPST_VERSION = '0.11.0';
const URL = `https://github.com/typst/typst/releases/download/v${TYPST_VERSION}/typst-x86_64-unknown-linux-musl.tar.xz`;
const TARGET_DIR = path.resolve(__dirname, '..');
const BIN_PATH = path.join(TARGET_DIR, 'typst-bin');

function install() {
  console.log(`--- Typst Installer ---`);
  console.log(`Platform: ${os.platform()}`);
  console.log(`CWD: ${process.cwd()}`);
  console.log(`__dirname: ${__dirname}`);
  
  if (os.platform() !== 'linux') {
    console.log('Skipping Typst installation: Not on Linux.');
    return;
  }

  console.log(`Installing Typst v${TYPST_VERSION} to ${TARGET_DIR}...`);

  try {
    // Check if already installed
    if (fs.existsSync(BIN_PATH)) {
      console.log('Typst is already installed.');
      return;
    }

    console.log('Downloading Typst...');
    try {
      execSync(`curl -L ${URL} -o typst.tar.xz`, { cwd: TARGET_DIR });
    } catch (e) {
      console.log('curl failed, trying wget...');
      execSync(`wget ${URL} -O typst.tar.xz`, { cwd: TARGET_DIR });
    }
    
    console.log('Extracting Typst...');
    execSync(`tar -xJf typst.tar.xz`, { cwd: TARGET_DIR });
    
    console.log('Setting up binary...');
    const extractedDir = path.join(TARGET_DIR, 'typst-x86_64-unknown-linux-musl');
    fs.renameSync(path.join(extractedDir, 'typst'), BIN_PATH);
    
    console.log('Cleaning up...');
    execSync(`rm -rf typst.tar.xz typst-x86_64-unknown-linux-musl`, { cwd: TARGET_DIR });
    execSync(`chmod +x ${BIN_PATH}`);

    console.log(`Successfully installed Typst to ${BIN_PATH}`);
  } catch (error) {
    console.error('ERROR: Typst installation failed!', error.message);
    process.exit(1); // Fail the build so we see it in logs
  }
}

install();
