imagecompare.js
==========
This will compare the images from source and destination directoty considering both will have same directory structure and file names.
To use this project you will need to have a set of image pairs to compare.
Each pair of images should be named the same then it will check the source file with same name at relavant destination directory path and create result difference image in ./demo/outout directory. 
If the destination directory dont have the respective file present it will not return the difference image.

This project depends upon the resemblejs which does analyse and compare images with Javascript and HTML5. [More info & Resemble.js Demo](http://huddle.github.com/Resemble.js/). Compatible with Node.js.

![Two image diff examples side-by-side, one pink, one yellow.](https://raw.github.com/Huddle/Resemble.js/master/demoassets/readmeimage.jpg "Visual image comparison")


### Install node

It is recommeneded to install Node using Node Version Manager

https://github.com/creationix/nvm

On Node, Resemble uses the `canvas` package instead of the native canvas support in the browser. To prevent browser users from being forced into installing Canvas, it's included as a peer dependency which means you have to install it alongside Resemble.

Canvas relies on some native image manipulation libraries to be install on the system. Please read the [Canvas installation instructions](https://www.npmjs.com/package/canvas) for OSX/Windows/Linux.

*Example commands for installation on Ubuntu*

``` bash
##Install node.js##
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs

##Install nvm##
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
source ~/.bashrc

sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
npm install canvas
npm install canvas-prebuilt
```

### Prepare reference and test image to compare

## Step 1 - clone the project and update config file for source anbd test images directory
```$ git clone https://github.com/abhijeetardale/regression-image-analysis-reports```
```$ cd regression-image-analysis-reports```

update config file(settings.json)  for sourceDirectoryPath and testDirectoryPath and both should be absolue path from root directory.

## Step 2 - Install node dependancies

```$ npm install```

## Step 3 - Run analysis 

```$ node imagecompare```

## Step 3 - Genearte Report 

```$ node report```

report will be genrated upder ./demo/report.html. You can open it in your default browser.

## Additional

To check the demo file comparision under .${project}/demo, please update the config file(settings.json) for sourceDirectoryPath and testDirectoryPath  and both should be absolue path from root directory.
