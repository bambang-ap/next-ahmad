NOTE: Untuk master item, hanya bisa di select jadi tidak ada menu master item
untuk input item, bisa langsung pada saat input PO
pada saat input PO, bisa lakukan select distinct agar data pada select tidak duplicate

# IMI Inventory

## Running on Local

- clone this project `git clone https://github.com/bambang-ap/next-ahmad.git`
- `cd next-ahmad`
- `yarn install`
- `nvm use 16`
- `yarn dev`

## Running on Server

1. `cd ~/snap/project/next-ahmad/`
2. `yarn install`
3. `nvm use 16`
4. `yarn build`
5. `yarn start`
6. if shown error `EADDRINUSE`, do this step
	1. exec `lsof -i:80`
	2. copy number PID of the process
	3. `kill {PID}`. example `kill 1234`
	4. `yarn start`


## Restart server

- Follow the step on `Running on Server` part 6.1 - 6.4


pm2 startup
pm2 save

pm2 unstartup