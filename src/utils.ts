import { Nft, User, Ownership } from '../generated/schema';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { NecoNFT } from '../generated/NecoNFT/NecoNFT';

let ZERO_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000")
let BIGINT_ZERO = BigInt.fromI32(0)

export function handleTransferToken(
    contractAddress: Address, from: Address, to: Address, id: BigInt, value: BigInt, timestamp: BigInt
  ): void {
    const entityId = id.toHex()
    let nft = Nft.load(entityId);
    if (nft === null) {
      nft = new Nft(entityId);
      const contract = NecoNFT.bind(contractAddress)
      nft.nftId = id.toString();
      nft.nftType1 = contract.getNFTType1(id).toI32();
      nft.nftType2 = contract.getNFTType2(id).toI32();
      nft.metadataUrl = contract.uri(id);
      nft.createTime = timestamp;
      nft.save();
    }

    const fromUserEntityId = from.toHex();
    let fromUser = User.load(fromUserEntityId);
    if (fromUser === null) {
      fromUser = new User(fromUserEntityId);
      fromUser.address = from.toHexString();
      fromUser.save();
    }

    const toUserEntityId = to.toHex();
    let toUser = User.load(toUserEntityId);
    if (toUser === null) {
      toUser = new User(toUserEntityId);
      toUser.address = to.toHexString();
      toUser.save();
    }

    updateOwnership(nft, fromUser, value, true);
    updateOwnership(nft, toUser, value, false)
  }

  /**
   * Update Ownership
   * @param nft
   * @param user
   * @param quantity
   * @param isFrom
   */
  export function updateOwnership(nft: Nft, user: User, quantity: BigInt, isFrom: bool): void {
    const ownershipId = nft.id.toString() + "_" + user.id.toString()
    let ownership = Ownership.load(ownershipId)

    if (ownership === null) {
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

    // if (newBalance.lt(BIGINT_ZERO)) {
    //   throw new Error("Negative token quantity")
    // }

    ownership.quantity = newBalance
    ownership.save()
  }
