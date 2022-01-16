import { NFT, User, Ownership } from '../generated/schema';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { NecoNFT } from '../generated/NecoNFT/NecoNFT';

let ZERO_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000")
let BIGINT_ZERO = BigInt.fromI32(0)

export function handleTransferToken(
    contractAddress: Address, from: Address, to: Address, id: BigInt, value: BigInt, timestamp: BigInt
  ): void {
    const entityId = id.toHex()
    let nft = NFT.load(entityId);
    if (nft == null) {
      nft = new NFT(entityId);
      const contract = NecoNFT.bind(contractAddress)
      nft.nftId = id;
      nft.nftType = contract.getNFTType(id).toString();
      nft.metadataUrl = contract.uri(id);
      nft.createTime = timestamp;
      nft.save();
    }

    const fromUserEntityId = from.toString();
    let fromUser = User.load(fromUserEntityId);
    if (fromUser == null) {
      fromUser = new User(fromUserEntityId);
      fromUser.address = from.toHexString();
      fromUser.save();
    }

    const toUserEntityId = to.toString();
    let toUser = User.load(toUserEntityId);
    if (toUser == null) {
      toUser = new User(toUserEntityId);
      toUser.address = to.toHexString();
      toUser.save();
    }

    if (fromUser.address != ZERO_ADDRESS.toHexString()) {
      updateOwnership(nft, fromUser, value, true);
    }
    updateOwnership(nft, toUser, value, false)
  }

  export function updateOwnership(nft: NFT, user: User, quantity: BigInt, isFrom: bool): void {
    const ownershipId = nft.id + '_' + user.id
    let ownership = Ownership.load(ownershipId)

    if (ownership == null) {
      ownership = new Ownership(ownershipId)
      ownership.nft = nft.id
      ownership.user = user.id;
      ownership.quantity = BIGINT_ZERO;
    }

    let newBalance = BIGINT_ZERO;
    if (isFrom) {
      newBalance = ownership.quantity.minus(quantity)
    } else {
      newBalance = ownership.quantity.plus(quantity);
    }

    if (newBalance.lt(BIGINT_ZERO)) {
      throw new Error("Negative token quantity")
    }

    ownership.quantity = newBalance
    ownership.save()
  }
