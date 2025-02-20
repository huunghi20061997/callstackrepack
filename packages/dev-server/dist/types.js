export let Server;
/** Representation of the compilation progress. */
/**
 * Type representing a function to send the progress.
 *
 * Used by {@link CompilerDelegate} in `getAsset` function to send the compilation
 * progress to the client who requested the asset.
 */
/**
 * Internal types. Do not use.
 *
 * @internal
 */
export let Internal;
(function (_Internal) {
  let EventTypes = /*#__PURE__*/function (EventTypes) {
    EventTypes["BuildStart"] = "BuildStart";
    EventTypes["BuildEnd"] = "BuildEnd";
    EventTypes["HmrEvent"] = "HmrEvent";
    return EventTypes;
  }({});
  _Internal.EventTypes = EventTypes;
})(Internal || (Internal = {}));
//# sourceMappingURL=types.js.map