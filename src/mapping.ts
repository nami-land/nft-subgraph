import { BigInt } from "@graphprotocol/graph-ts"
import {
  ApprovalForAll,
  OwnershipTransferred,
  TransferBatch,
  TransferSingle,
  URI
} from "../generated/NecoNFT/NecoNFT"
import { handleTransferToken } from "./utils"
import { NecoNFT } from '../generated/NecoNFT/NecoNFT';

export function handleApprovalForAll(event: ApprovalForAll): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  // if (!entity) {
  //   entity = new ExampleEntity(event.transaction.from.toHex())

  //   // Entity fields can be set using simple assignments
  //   entity.count = BigInt.fromI32(0)
  // }

  // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // // Entity fields can be set based on event parameters
  // entity.account = event.params.account
  // entity.operator = event.params.operator

  // // Entities can be written to the store with `.save()`
  // entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOf(...)
  // - contract.balanceOfBatch(...)
  // - contract.creators(...)
  // - contract.getLockedTokenIdsByIndex(...)
  // - contract.getLockedTokenIdsLength(...)
  // - contract.getTokenIdByIndex(...)
  // - contract.getTokenIdsLength(...)
  // - contract.isApprovedForAll(...)
  // - contract.owner(...)
  // - contract.supportsInterface(...)
  // - contract.transferWhitelist(...)
  // - contract.uri(...)
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransferBatch(event: TransferBatch): void {
  if (event.params.ids.length != event.params.values.length) {
    throw new Error("Inconsistent arrays length in TransferBatch")
  }

  for (let i = 0; i < event.params.ids.length; i++) {
    let ids = event.params.ids;
    let values = event.params.values;
    handleTransferToken(
        event.address,
        event.params.from,
        event.params.to,
        ids[i],
        values[i],
        event.block.timestamp
    );
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  handleTransferToken(
    event.address,
    event.params.from,
    event.params.to,
    event.params.id,
    event.params.value,
    event.block.timestamp
  )
}

export function handleURI(event: URI): void {}
