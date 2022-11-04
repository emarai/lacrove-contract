# Create and upload metadata

```
$ nft pack sample-metadata --output sample-metadata.car
$ nft upload sample-metadata.car
```

# Testnet deploy and add whitelist + freemints

## Build contract

```
$ yarn install
$ yarn build
```

## Deploy

```
$ yarn deploy:testnet:lacrove --accountId dev-1664109157601-89732831767264
```

## Add whitelist

```
$ near repl -s ./scripts/add-whitelist.ts --accountId dev-1664109157601-89732831767264 -- whitelisted.json dev-1664109157601-89732831767264 3
```

## Add freemints

```
$ near repl -s ./scripts/add-freemints.ts --accountId dev-1664109157601-89732831767264 -- freeminted.json dev-1664109157601-89732831767264 3
```
