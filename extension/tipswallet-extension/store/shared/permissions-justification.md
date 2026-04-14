# Permissions Justification

## storage
Used to store the encrypted local vault, session state, connections, and pending approval requests.

## tabs
Used to open the Tipspay DEX and ecosystem links from the wallet.

## notifications
Reserved for future transaction and security notifications. Remove this permission if not needed before final submission.

## host permissions
Used for:
- content script injection on websites that request an EIP-1193 provider
- RPC communication with TipsChain endpoints
- opening and connecting to Tipspay DEX and ecosystem domains

## security statement
The extension does not request unnecessary privileged permissions such as proxy, debugger, nativeMessaging, or downloads.
