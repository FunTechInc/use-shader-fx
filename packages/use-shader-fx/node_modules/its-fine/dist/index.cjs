"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const React = require("react");
function _interopNamespace(e) {
  if (e && e.__esModule)
    return e;
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const React__namespace = /* @__PURE__ */ _interopNamespace(React);
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
function traverseFiber(fiber, ascending, selector) {
  if (!fiber)
    return;
  if (selector(fiber) === true)
    return fiber;
  let child = ascending ? fiber.return : fiber.child;
  while (child) {
    const match = traverseFiber(child, ascending, selector);
    if (match)
      return match;
    child = ascending ? null : child.sibling;
  }
}
function wrapContext(context) {
  try {
    return Object.defineProperties(context, {
      _currentRenderer: {
        get() {
          return null;
        },
        set() {
        }
      },
      _currentRenderer2: {
        get() {
          return null;
        },
        set() {
        }
      }
    });
  } catch (_) {
    return context;
  }
}
const FiberContext = wrapContext(React__namespace.createContext(null));
class FiberProvider extends React__namespace.Component {
  render() {
    return /* @__PURE__ */ React__namespace.createElement(FiberContext.Provider, {
      value: this._reactInternals
    }, this.props.children);
  }
}
const { ReactCurrentOwner, ReactCurrentDispatcher } = React__namespace.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
function useFiber() {
  const root = React__namespace.useContext(FiberContext);
  if (root === null)
    throw new Error("its-fine: useFiber must be called within a <FiberProvider />!");
  const id = React__namespace.useId();
  const fiber = React__namespace.useMemo(() => {
    for (const maybeFiber of [ReactCurrentOwner == null ? void 0 : ReactCurrentOwner.current, root, root == null ? void 0 : root.alternate]) {
      if (!maybeFiber)
        continue;
      const fiber2 = traverseFiber(maybeFiber, false, (node) => {
        let state = node.memoizedState;
        while (state) {
          if (state.memoizedState === id)
            return true;
          state = state.next;
        }
      });
      if (fiber2)
        return fiber2;
    }
  }, [root, id]);
  return fiber;
}
function useContainer() {
  const fiber = useFiber();
  const root = React__namespace.useMemo(
    () => traverseFiber(fiber, true, (node) => {
      var _a;
      return ((_a = node.stateNode) == null ? void 0 : _a.containerInfo) != null;
    }),
    [fiber]
  );
  return root == null ? void 0 : root.stateNode.containerInfo;
}
function useNearestChild(type) {
  const fiber = useFiber();
  const childRef = React__namespace.useRef();
  React__namespace.useLayoutEffect(() => {
    var _a;
    childRef.current = (_a = traverseFiber(
      fiber,
      false,
      (node) => typeof node.type === "string" && (type === void 0 || node.type === type)
    )) == null ? void 0 : _a.stateNode;
  }, [fiber]);
  return childRef;
}
function useNearestParent(type) {
  const fiber = useFiber();
  const parentRef = React__namespace.useRef();
  React__namespace.useLayoutEffect(() => {
    var _a;
    parentRef.current = (_a = traverseFiber(
      fiber,
      true,
      (node) => typeof node.type === "string" && (type === void 0 || node.type === type)
    )) == null ? void 0 : _a.stateNode;
  }, [fiber]);
  return parentRef;
}
function useContextMap() {
  var _a, _b;
  const fiber = useFiber();
  const [contextMap] = React__namespace.useState(() => /* @__PURE__ */ new Map());
  contextMap.clear();
  let node = fiber;
  while (node) {
    const context = (_a = node.type) == null ? void 0 : _a._context;
    if (context && context !== FiberContext && !contextMap.has(context)) {
      contextMap.set(context, (_b = ReactCurrentDispatcher == null ? void 0 : ReactCurrentDispatcher.current) == null ? void 0 : _b.readContext(wrapContext(context)));
    }
    node = node.return;
  }
  return contextMap;
}
function useContextBridge() {
  const contextMap = useContextMap();
  return React__namespace.useMemo(
    () => Array.from(contextMap.keys()).reduce(
      (Prev, context) => (props) => /* @__PURE__ */ React__namespace.createElement(Prev, null, /* @__PURE__ */ React__namespace.createElement(context.Provider, __spreadProps(__spreadValues({}, props), {
        value: contextMap.get(context)
      }))),
      (props) => /* @__PURE__ */ React__namespace.createElement(FiberProvider, __spreadValues({}, props))
    ),
    [contextMap]
  );
}
exports.FiberProvider = FiberProvider;
exports.traverseFiber = traverseFiber;
exports.useContainer = useContainer;
exports.useContextBridge = useContextBridge;
exports.useContextMap = useContextMap;
exports.useFiber = useFiber;
exports.useNearestChild = useNearestChild;
exports.useNearestParent = useNearestParent;
//# sourceMappingURL=index.cjs.map
