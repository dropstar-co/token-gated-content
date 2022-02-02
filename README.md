# Token Gated Content - Venly Custodial Wallet

Three directories:

- docker
- token-gated-content-backend
- token-gated-content-frontend

## Requisites

```
nvm use 14
```

## Start local development environment

You need to create a .env file with the following content (fill the ones between <>)

```
PORT=8000
DB_USER=tokengatedcontent
DB_HOST=127.0.0.1
DB_NAME=tokengatedcontent
DB_PASSWORD=tokengatedcontent
DB_PORT=5432

VENLY_API_CLIENT_ID=<venly_client_id>
VENLY_API_SECRET_ID=<venly-secret-id>
VENLY_API_APPLICATION_ID=<venly-application-id>

CHAIN_ID=80001
ALCHEMY_HTTPS=https://polygon-mumbai.g.alchemy.com/v2/<alchemy_key>
ALCHEMY_WSS=wss://polygon-mumbai.g.alchemy.com/v2/<alchemy_key>

SIGNATURE_TIMESPAN=3600

DATABASE_URL=postgres://tokengatedcontent:tokengatedcontent@127.0.0.1:5432/tokengatedcontent
DEV_DATABASE_URL=postgres://tokengatedcontent:tokengatedcontent@127.0.0.1:5432/tokengatedcontent
TEST_DATABASE_URL=postgres://tokengatedcontent:tokengatedcontent@127.0.0.1:5432/tokengatedcontent

TEST_TIMEOUT=10000000
TEST_PINCODE=000000
TEST_ADDRESS=<your nft hodlder adress>
TEST_WALLET_ID=<your venly wallet id>

TEST_ADDRESS_BAD=<some other nft hodlder adress>
TEST_WALLET_ID_BAD=<some other venly wallet id>
TEST_TOKEN_ADDRESS=<your NFT contract address>
TEST_TOKEN_ID=<your NFT token_id>
```

## Start the database and backend

```bash
pushd docker
rm -rf postgis
docker-compose up -d db
popd

pushd token-gated-content-backend
yarn install
npx sequelize db:migrate
npx sequelize db:seed:all
npm test
pm2 --name TokenGatedContentBackend start npm -- start --watch
popd
```

(WIP) venly wallets must be created and the nft minted beforehand for the tests to work properly. Separate testing venly from testing this service.

And backend is running

### Start the frontend

Requisites: database and backend are already working properly

```bash

pushd token-gated-content-website
npm install
pm2 --name TokenGatedContentWebsite start npm -- start --watch
popd
```
