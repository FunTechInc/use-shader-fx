export default GUI;
export class GUI {
    /**
     * Creates a panel that holds controllers.
     * @example
     * new GUI();
     * new GUI( { container: document.getElementById( 'custom' ) } );
     *
     * @param {object} [options]
     * @param {boolean} [options.autoPlace=true]
     * Adds the GUI to `document.body` and fixes it to the top right of the page.
     *
     * @param {HTMLElement} [options.container]
     * Adds the GUI to this DOM element. Overrides `autoPlace`.
     *
     * @param {number} [options.width=245]
     * Width of the GUI in pixels, usually set when name labels become too long. Note that you can make
     * name labels wider in CSS with `.lil‑gui { ‑‑name‑width: 55% }`
     *
     * @param {string} [options.title=Controls]
     * Name to display in the title bar.
     *
     * @param {boolean} [options.injectStyles=true]
     * Injects the default stylesheet into the page if this is the first GUI.
     * Pass `false` to use your own stylesheet.
     *
     * @param {number} [options.touchStyles=true]
     * Makes controllers larger on touch devices. Pass `false` to disable touch styles.
     *
     * @param {GUI} [options.parent]
     * Adds this GUI as a child in another GUI. Usually this is done for you by `addFolder()`.
     *
     */
    constructor({ parent, autoPlace, container, width, title, injectStyles, touchStyles }?: {
        autoPlace?: boolean;
        container?: HTMLElement;
        width?: number;
        title?: string;
        injectStyles?: boolean;
        touchStyles?: number;
        parent?: GUI;
    });
    /**
     * The GUI containing this folder, or `undefined` if this is the root GUI.
     * @type {GUI}
     */
    parent: GUI;
    /**
     * The top level GUI containing this folder, or `this` if this is the root GUI.
     * @type {GUI}
     */
    root: GUI;
    /**
     * The list of controllers and folders contained by this GUI.
     * @type {Array<GUI|Controller>}
     */
    children: Array<GUI | Controller>;
    /**
     * The list of controllers contained by this GUI.
     * @type {Array<Controller>}
     */
    controllers: Array<Controller>;
    /**
     * The list of folders contained by this GUI.
     * @type {Array<GUI>}
     */
    folders: Array<GUI>;
    /**
     * Used to determine if the GUI is closed. Use `gui.open()` or `gui.close()` to change this.
     * @type {boolean}
     */
    _closed: boolean;
    /**
     * Used to determine if the GUI is hidden. Use `gui.show()` or `gui.hide()` to change this.
     * @type {boolean}
     */
    _hidden: boolean;
    /**
     * The outermost container element.
     * @type {HTMLElement}
     */
    domElement: HTMLElement;
    /**
     * The DOM element that contains the title.
     * @type {HTMLElement}
     */
    $title: HTMLElement;
    /**
     * The DOM element that contains children.
     * @type {HTMLElement}
     */
    $children: HTMLElement;
    /**
     * Adds a controller to the GUI, inferring controller type using the `typeof` operator.
     * @example
     * gui.add( object, 'property' );
     * gui.add( object, 'number', 0, 100, 1 );
     * gui.add( object, 'options', [ 1, 2, 3 ] );
     *
     * @param {object} object The object the controller will modify.
     * @param {string} property Name of the property to control.
     * @param {number|object|Array} [$1] Minimum value for number controllers, or the set of
     * selectable values for a dropdown.
     * @param {number} [max] Maximum value for number controllers.
     * @param {number} [step] Step value for number controllers.
     * @returns {Controller}
     */
    add(object: object, property: string, $1?: number | object | any[], max?: number, step?: number): Controller;
    /**
     * Adds a color controller to the GUI.
     * @example
     * params = {
     * 	cssColor: '#ff00ff',
     * 	rgbColor: { r: 0, g: 0.2, b: 0.4 },
     * 	customRange: [ 0, 127, 255 ],
     * };
     *
     * gui.addColor( params, 'cssColor' );
     * gui.addColor( params, 'rgbColor' );
     * gui.addColor( params, 'customRange', 255 );
     *
     * @param {object} object The object the controller will modify.
     * @param {string} property Name of the property to control.
     * @param {number} rgbScale Maximum value for a color channel when using an RGB color. You may
     * need to set this to 255 if your colors are too bright.
     * @returns {Controller}
     */
    addColor(object: object, property: string, rgbScale?: number): Controller;
    /**
     * Adds a folder to the GUI, which is just another GUI. This method returns
     * the nested GUI so you can add controllers to it.
     * @example
     * const folder = gui.addFolder( 'Position' );
     * folder.add( position, 'x' );
     * folder.add( position, 'y' );
     * folder.add( position, 'z' );
     *
     * @param {string} title Name to display in the folder's title bar.
     * @returns {GUI}
     */
    addFolder(title: string): GUI;
    /**
     * Recalls values that were saved with `gui.save()`.
     * @param {object} obj
     * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
     * @returns {this}
     */
    load(obj: object, recursive?: boolean): this;
    /**
     * Returns an object mapping controller names to values. The object can be passed to `gui.load()` to
     * recall these values.
     * @example
     * {
     * 	controllers: {
     * 		prop1: 1,
     * 		prop2: 'value',
     * 		...
     * 	},
     * 	folders: {
     * 		folderName1: { controllers, folders },
     * 		folderName2: { controllers, folders }
     * 		...
     * 	}
     * }
     *
     * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
     * @returns {object}
     */
    save(recursive?: boolean): object;
    /**
     * Opens a GUI or folder. GUI and folders are open by default.
     * @param {boolean} open Pass false to close
     * @returns {this}
     * @example
     * gui.open(); // open
     * gui.open( false ); // close
     * gui.open( gui._closed ); // toggle
     */
    open(open?: boolean): this;
    /**
     * Closes the GUI.
     * @returns {this}
     */
    close(): this;
    /**
     * Shows the GUI after it's been hidden.
     * @param {boolean} show
     * @returns {this}
     * @example
     * gui.show();
     * gui.show( false ); // hide
     * gui.show( gui._hidden ); // toggle
     */
    show(show?: boolean): this;
    /**
     * Hides the GUI.
     * @returns {this}
     */
    hide(): this;
    openAnimated(open?: boolean): GUI;
    /**
     * Change the title of this GUI.
     * @param {string} title
     * @returns {this}
     */
    title(title: string): this;
    /**
     * Current title of the GUI. Use `gui.title( 'Title' )` to modify this value.
     * @type {string}
     */
    _title: string;
    /**
     * Resets all controllers to their initial values.
     * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
     * @returns {this}
     */
    reset(recursive?: boolean): this;
    /**
     * Pass a function to be called whenever a controller in this GUI changes.
     * @param {function({object:object, property:string, value:any, controller:Controller})} callback
     * @returns {this}
     * @example
     * gui.onChange( event => {
     * 	event.object     // object that was modified
     * 	event.property   // string, name of property
     * 	event.value      // new value of controller
     * 	event.controller // controller that was modified
     * } );
     */
    onChange(callback: (arg0: {
        object: object;
        property: string;
        value: any;
        controller: Controller;
    }) => any): this;
    /**
     * Used to access the function bound to `onChange` events. Don't modify this value
     * directly. Use the `gui.onChange( callback )` method instead.
     * @type {Function}
     */
    _onChange: Function;
    _callOnChange(controller: any): void;
    /**
     * Pass a function to be called whenever a controller in this GUI has finished changing.
     * @param {function({object:object, property:string, value:any, controller:Controller})} callback
     * @returns {this}
     * @example
     * gui.onFinishChange( event => {
     * 	event.object     // object that was modified
     * 	event.property   // string, name of property
     * 	event.value      // new value of controller
     * 	event.controller // controller that was modified
     * } );
     */
    onFinishChange(callback: (arg0: {
        object: object;
        property: string;
        value: any;
        controller: Controller;
    }) => any): this;
    /**
     * Used to access the function bound to `onFinishChange` events. Don't modify this value
     * directly. Use the `gui.onFinishChange( callback )` method instead.
     * @type {Function}
     */
    _onFinishChange: Function;
    _callOnFinishChange(controller: any): void;
    /**
     * Destroys all DOM elements and event listeners associated with this GUI
     */
    destroy(): void;
    /**
     * Returns an array of controllers contained by this GUI and its descendents.
     * @returns {Controller[]}
     */
    controllersRecursive(): Controller[];
    /**
     * Returns an array of folders contained by this GUI and its descendents.
     * @returns {GUI[]}
     */
    foldersRecursive(): GUI[];
}
export class BooleanController extends Controller {
    constructor(parent: any, object: any, property: any);
    $input: HTMLInputElement;
}
export class ColorController extends Controller {
    constructor(parent: any, object: any, property: any, rgbScale: any);
    $input: HTMLInputElement;
    $text: HTMLInputElement;
    $display: HTMLDivElement;
    _format: {
        isPrimitive: boolean;
        match: (v: any) => boolean;
        fromHexString: typeof normalizeColorString;
        toHexString: typeof normalizeColorString;
    } | {
        isPrimitive: boolean;
        match: (arg: any) => arg is any[];
        fromHexString(string: any, target: any, rgbScale?: number): void;
        toHexString([r, g, b]: [any, any, any], rgbScale?: number): string;
    } | {
        isPrimitive: boolean;
        match: (v: any) => boolean;
        fromHexString(string: any, target: any, rgbScale?: number): void;
        toHexString({ r, g, b }: {
            r: any;
            g: any;
            b: any;
        }, rgbScale?: number): string;
    };
    _rgbScale: any;
    _initialValueHexString: string | boolean;
    _textFocused: boolean;
    _setValueFromHexString(value: any): void;
}
/**
 * lil-gui
 * https://lil-gui.georgealways.com
 * @version 0.17.0
 * @author George Michael Brower
 * @license MIT
 */
/**
 * Base class for all controllers.
 */
export class Controller {
    constructor(parent: any, object: any, property: any, className: any, widgetTag?: string);
    /**
     * The GUI that contains this controller.
     * @type {GUI}
     */
    parent: GUI;
    /**
     * The object this controller will modify.
     * @type {object}
     */
    object: object;
    /**
     * The name of the property to control.
     * @type {string}
     */
    property: string;
    /**
     * Used to determine if the controller is disabled.
     * Use `controller.disable( true|false )` to modify this value
     * @type {boolean}
     */
    _disabled: boolean;
    /**
     * Used to determine if the Controller is hidden.
     * Use `controller.show()` or `controller.hide()` to change this.
     * @type {boolean}
     */
    _hidden: boolean;
    /**
     * The value of `object[ property ]` when the controller was created.
     * @type {any}
     */
    initialValue: any;
    /**
     * The outermost container DOM element for this controller.
     * @type {HTMLElement}
     */
    domElement: HTMLElement;
    /**
     * The DOM element that contains the controller's name.
     * @type {HTMLElement}
     */
    $name: HTMLElement;
    /**
     * The DOM element that contains the controller's "widget" (which differs by controller type).
     * @type {HTMLElement}
     */
    $widget: HTMLElement;
    /**
     * The DOM element that receives the disabled attribute when using disable()
     * @type {HTMLElement}
     */
    $disable: HTMLElement;
    _listenCallback(): void;
    /**
     * Sets the name of the controller and its label in the GUI.
     * @param {string} name
     * @returns {this}
     */
    name(name: string): this;
    /**
     * The controller's name. Use `controller.name( 'Name' )` to modify this value.
     * @type {string}
     */
    _name: string;
    /**
     * Pass a function to be called whenever the value is modified by this controller.
     * The function receives the new value as its first parameter. The value of `this` will be the
     * controller.
     * @param {Function} callback
     * @returns {this}
     * @example
     * const controller = gui.add( object, 'property' );
     *
     * controller.onChange( function( v ) {
     * 	console.log( 'The value is now ' + v );
     * 	console.assert( this === controller );
     * } );
     */
    onChange(callback: Function): this;
    /**
     * Used to access the function bound to `onChange` events. Don't modify this value directly.
     * Use the `controller.onChange( callback )` method instead.
     * @type {Function}
     */
    _onChange: Function;
    /**
     * Calls the onChange methods of this controller and its parent GUI.
     * @protected
     */
    protected _callOnChange(): void;
    _changed: boolean;
    /**
     * Pass a function to be called after this controller has been modified and loses focus.
     * @param {Function} callback
     * @returns {this}
     * @example
     * const controller = gui.add( object, 'property' );
     *
     * controller.onFinishChange( function( v ) {
     * 	console.log( 'Changes complete: ' + v );
     * 	console.assert( this === controller );
     * } );
     */
    onFinishChange(callback: Function): this;
    /**
     * Used to access the function bound to `onFinishChange` events. Don't modify this value
     * directly. Use the `controller.onFinishChange( callback )` method instead.
     * @type {Function}
     */
    _onFinishChange: Function;
    /**
     * Should be called by Controller when its widgets lose focus.
     * @protected
     */
    protected _callOnFinishChange(): void;
    /**
     * Sets the controller back to its initial value.
     * @returns {this}
     */
    reset(): this;
    /**
     * Enables this controller.
     * @param {boolean} enabled
     * @returns {this}
     * @example
     * controller.enable();
     * controller.enable( false ); // disable
     * controller.enable( controller._disabled ); // toggle
     */
    enable(enabled?: boolean): this;
    /**
     * Disables this controller.
     * @param {boolean} disabled
     * @returns {this}
     * @example
     * controller.disable();
     * controller.disable( false ); // enable
     * controller.disable( !controller._disabled ); // toggle
     */
    disable(disabled?: boolean): this;
    /**
     * Shows the Controller after it's been hidden.
     * @param {boolean} show
     * @returns {this}
     * @example
     * controller.show();
     * controller.show( false ); // hide
     * controller.show( controller._hidden ); // toggle
     */
    show(show?: boolean): this;
    /**
     * Hides the Controller.
     * @returns {this}
     */
    hide(): this;
    /**
     * Destroys this controller and replaces it with a new option controller. Provided as a more
     * descriptive syntax for `gui.add`, but primarily for compatibility with dat.gui.
     *
     * Use caution, as this method will destroy old references to this controller. It will also
     * change controller order if called out of sequence, moving the option controller to the end of
     * the GUI.
     * @example
     * // safe usage
     *
     * gui.add( object1, 'property' ).options( [ 'a', 'b', 'c' ] );
     * gui.add( object2, 'property' );
     *
     * // danger
     *
     * const c = gui.add( object1, 'property' );
     * gui.add( object2, 'property' );
     *
     * c.options( [ 'a', 'b', 'c' ] );
     * // controller is now at the end of the GUI even though it was added first
     *
     * assert( c.parent.children.indexOf( c ) === -1 )
     * // c references a controller that no longer exists
     *
     * @param {object|Array} options
     * @returns {Controller}
     */
    options(options: object | any[]): Controller;
    /**
     * Sets the minimum value. Only works on number controllers.
     * @param {number} min
     * @returns {this}
     */
    min(min: number): this;
    /**
     * Sets the maximum value. Only works on number controllers.
     * @param {number} max
     * @returns {this}
     */
    max(max: number): this;
    /**
     * Values set by this controller will be rounded to multiples of `step`. Only works on number
     * controllers.
     * @param {number} step
     * @returns {this}
     */
    step(step: number): this;
    /**
     * Rounds the displayed value to a fixed number of decimals, without affecting the actual value
     * like `step()`. Only works on number controllers.
     * @example
     * gui.add( object, 'property' ).listen().decimals( 4 );
     * @param {number} decimals
     * @returns {this}
     */
    decimals(decimals: number): this;
    /**
     * Calls `updateDisplay()` every animation frame. Pass `false` to stop listening.
     * @param {boolean} listen
     * @returns {this}
     */
    listen(listen?: boolean): this;
    /**
     * Used to determine if the controller is currently listening. Don't modify this value
     * directly. Use the `controller.listen( true|false )` method instead.
     * @type {boolean}
     */
    _listening: boolean;
    _listenCallbackID: number;
    _listenPrevValue: any;
    /**
     * Returns `object[ property ]`.
     * @returns {any}
     */
    getValue(): any;
    /**
     * Sets the value of `object[ property ]`, invokes any `onChange` handlers and updates the display.
     * @param {any} value
     * @returns {this}
     */
    setValue(value: any): this;
    /**
     * Updates the display to keep it in sync with the current value. Useful for updating your
     * controllers when their values have been modified outside of the GUI.
     * @returns {this}
     */
    updateDisplay(): this;
    load(value: any): Controller;
    save(): any;
    /**
     * Destroys this controller and removes it from the parent GUI.
     */
    destroy(): void;
}
export class FunctionController extends Controller {
    constructor(parent: any, object: any, property: any);
    $button: HTMLButtonElement;
}
export class NumberController extends Controller {
    constructor(parent: any, object: any, property: any, min: any, max: any, step: any);
    _decimals: any;
    _min: any;
    _max: any;
    _step: any;
    _stepExplicit: boolean;
    _initInput(): void;
    $input: HTMLInputElement;
    _inputFocused: boolean;
    _initSlider(): void;
    _hasSlider: boolean;
    $slider: HTMLDivElement;
    $fill: HTMLDivElement;
    _setDraggingStyle(active: any, axis?: string): void;
    _getImplicitStep(): number;
    _onUpdateMinMax(): void;
    _normalizeMouseWheel(e: any): any;
    _arrowKeyMultiplier(e: any): number;
    _snap(value: any): number;
    _clamp(value: any): any;
    _snapClampSetValue(value: any): void;
    get _hasScrollBar(): boolean;
    get _hasMin(): boolean;
    get _hasMax(): boolean;
}
export class OptionController extends Controller {
    constructor(parent: any, object: any, property: any, options: any);
    $select: HTMLSelectElement;
    $display: HTMLDivElement;
    _values: any[];
    _names: any[];
}
export class StringController extends Controller {
    constructor(parent: any, object: any, property: any);
    $input: HTMLInputElement;
}
declare function normalizeColorString(string: any): string | false;
