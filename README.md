# Operating System Page Replacement Simulator

## Why this Project

This is the 4th (also the final) **Experiment in Collaboration** for Operating System course of IMU.

## About this Project

An interactive web application that visualizes page replacement algorithms in operating systems,especially FIFO、LRU、LFU、OPT.

## Features

- **Interactive Visualization**: Step-by-step simulation of page replacement algorithms with a dynamic table display.
- **Algorithm Implemented**: 
  - FIFO
  - LRU
  - LFU
  - OPT
- **Intuitive Graphics and Animation**: Ability to watch each step or process automatically of the Intuitive Algorithms Simulation. Also the Intuitive graphics,which can watch and download.

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)
- Django
- markdown2

## Get Started

Follow these steps to set up the project on your local machine.

### Clone the Repository to your own machine

```bash
git clone https://github.com/log1011z/OS-Page-Replacement-Simulator.git
cd OS-Page-Replacement-Simulator
```

### Install Dependencies

```bash
cd .\os_project_page_replacement\page-replacement-simulator\|npm install
pip install django
pip install markdown2
```

### Build Tailwind CSS

```bash
npx tailwindcss -i ./style.css -o ./output.css
```

### Run this Project

Return to the root directory of the project

```bash
make -j run
```

OR Click the start.bat to start in Windows

## Thanks
[josefdc](https://github.com/josefdc/page-replacement-simulator)

[nutchanon-c](https://github.com/nutchanon-c/os_project_page_replacement)

[SilyCheese](https://github.com/CheeseSilly/OS-Page-Replacement-Simulator)

Thank you all:)

## License
This project is licensed under the MIT License.

