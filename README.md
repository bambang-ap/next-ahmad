# IMI Inventory

## Running on Local

- clone this project `git clone https://github.com/bambang-ap/next-ahmad.git`
- `cd next-ahmad`
- `yarn install`
- `nvm use 16`
- `yarn dev`

## Running on Server

1. `cd ~/snap/project/next-ahmad/`
1. `yarn build`
1. `yarn start`
1. if shown error `EADDRINUSE`, do this step
	1. exec `lsof -i:80`
	1. copy number PID of the process
	1. `kill {PID}`. example `kill 1234`
	1. `yarn start`


## Restart server

- Follow the step on `Running on Server` part 3.1 - 3.4