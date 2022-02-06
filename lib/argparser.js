const RequireEnum = Object.freeze({
  /**No additional arguments are required.*/
  "NONE": 1,
  /**One argument is required.*/
  "ONE": 2,
  /**Multiple arguments are required.*/
  "MANY": 3
})

/**Represents an error in the input of a command. Very similar to an exception.*/
class UserError{
  /**Initialize a new user error with an error message.
   * @param {string} message 
   */
  constructor(message){
    /**The message of the error.
     * @type {string}
     */
    this.message = message
  }

  /**Generate a user error about an incorrect number of arguments.
   * @returns {UserError}
   */
  static wrongArgNumber(){
    return new UserError("Wrong number of arguments")
  }

  /**Generate a user error about an illegal argument.
   * @returns {UserError}
   */
  static IllegalArg(arg){
    return new UserError(`Illegal argument \`${arg}\`.`)
  }

  /**Generate a user error about an unknown short option.
   * @returns {UserError}
   * @param {string} opt The character of the short option.
   */
  static unknownSOpt(opt){
    return new UserError(`Unknown option \`-${opt}\`.`)
  }

  /**Generate a user error about an unknown long option.
   * @returns {UserError}
   * @param {string} opt The character of the long option.
   */
  static unknownLOpt(opt){
    return new UserError(`Unknown option \`--${opt}\`.`)
  }

  /**Generate a user error about a short option that requires arguments being
   *in the middle of a option group. Example: option `-dfn` where `-f` requires
   *an argument.
   * @param {string} opt 
   * @param {string} arg 
   */
  static argOptMiddle(opt, arg){
    return new UserError(`Option \`-${opt}\` requires arguments, but is in the
middle of the options: \`${arg}\`.`)
  }
}

/**Represents a command line option/flag.*/
class ArgOption{
  /**The short version of the option. Without `-`.
   * @type {string}
  */
  #short = ''
  /**The long version of the option. Without `--`.
  * @type {string}
  */
  #long = ''
  /**Whether the option requires extra arguments.
  * @type {RequireEnum}
  */
  #require = RequireEnum.NONE
  /**The action the option performs.
   * @param {...string} args
   */
  #action = (...args) => {}
  

  /**The short version of the option. Without `-`.
   * @type {string}
  */
  get short() { return this.#short }
  /**The long version of the option. Without `--`.
  * @type {string}
  */
  get long() { return this.#long }
  /**Whether the option requires extra arguments.
  * @type {RequireEnum}
  */
  get require() { return this.#require }
  /**The action the option does.
   * @param {...string} args
   */
  get action() { return this.#action }
  /**Whether the option is a valid option.
   * @type {boolean}
   */
  get valid(){ return !!(this.#short || this.#long) }


  /**Initializes a new empty option.*/
  constructor(){}


  /**Set the short version of the option, without the `-`.
   * @param {string} short
   */
  setShort(short){
    if (typeof short != 'string') throw new TypeError(`Type of 'short' is 
${typeof(short)}, expected string.`)
    if (short.length != 1) throw new Error(`Length of 'short' is
${short.length}, expected a single character.`)

    this.#short = short
    return this
  }

  /**Set the long version of the option, without the `--`.
   * @param {string} long
   */
   setLong(long){
    if (typeof long != 'string') throw new TypeError(`Type of 'long' is 
${typeof(long)}, expected string.`)

    this.#long = long
    return this
  }
  
  /**Set the required arguments amount.
   * @param {RequireEnum} require
   */
   setRequire(require){
    if (!Object.values(RequireEnum).includes(require)) throw new RangeError(
`Value of 'require' is invalid, was ${require}, expected 'RequiredEnum' type
value.`)

    this.#require = require
    return this
  }

  /**Set the action that performs what happens when the option is specified.
   * @param {function(...string)} action
   */
   setAction(action){
    if (typeof action != 'function') throw new TypeError(`Type of 'action' is 
${typeof(action)}, expected function.`)

    this.#action = action
    return this
  }


  /**Call the action that performs what happens when the option is specified.
   * @param  {...any} args 
   */
  onOption(...args){
    if (!this.#action) return
    this.#action(...args)
  }
}

/**Represents a command line flag.*/
class ArgFlag extends ArgOption{
  /**Whether the flag has been set
   * @type {boolean}
   */
  #flag = false


  /**Whether the flag has been set
   * @type {boolean}
   */
  get flag(){ return this.#flag }


  /**Initialize a new flag.*/
  constructor(){
    super()
    this.setRequire(RequireEnum.NONE)
    this.setAction(() => this.#flag = true)
  }


  /**Reset the flag to it's intial state.*/
  reset(){ this.#flag = false }


  setRequire(){}
  setAction(){}

  onOption(){ this.#flag = true }
}

/**Represents a parser of command line arguments*/
class ArgsParser {
  /**An array of parsable option.
   * @type {ArgOption[]}
   */
  #options = []
  /**The function that gets called on all the non option/flag arguments at the
   *end of the 'parse' function.
   * @param {...string} args
   */
  #argsAction = (...args) => {}
  

  /**An array of parsable option.
   * @type {ArgOption[]}
   */
  get options() { return this.#options }
  
  /**Initializes a new parser.*/
  constructor(){}

  /**Handle a command line option.
   * @param {number} index
   * @param {ArgOption} opt 
   * @param  {...string} args 
   * @returns {number} The index of current option.
   * @throws {UserError} If the option is the last arguemnt but requires an
   *argument.
   */
  #opt(index, opt, ...args){
    /**@type {ArgOption[]}*/
    let optArgs = []

    if (opt.require == RequireEnum.ONE){
      if (index >= args.length) throw UserError.wrongArgNumber()
      index++
      optArgs.push(args[index])
    } else if (opt.require == RequireEnum.MANY){
      while(++index < args.length){
        let arg = args[index]
        if (arg[0] === '-') {
          index--
          break
        }
        optArgs.push(arg)
      }
    }

    opt.onOption(...optArgs)
    if (index >= args.length) index = args.length - 1
    return index
  }

  /**Handle a single short option.
   * @param {number} index The index of the short options.
   * @param {number} optIndex The index of the character of the short option.
   * @param {...string} args The arguments being parsed.
   * @returns {number} The index of current option.
   * @throws {UserError} If the option is not found or if it is in the middle
   *of a group of otions but requires an argument.
  */
  #shortOpt(index, optIndex, ...args){
    let char = args[index][optIndex]
    /**@type {ArgOption}*/
    let opt = null

    for (let option of this.#options){
      if (option.short === char){
        opt = option
        break;
      }
    }
    if (opt === null) throw UserError.unknownSOpt(char)

    //if the option requires arguments but isn't the last one
    if (opt.require !== RequireEnum.NONE && optIndex < args[index].length - 1)
      throw UserError.argOptMiddle(char, args[index])

    return this.#opt(index, opt, ...args)
  }

  /**Handle short options.
   * @param {number} index The index of the short options.
   * @param {...string} args The arguments being parsed.
   * @returns {number} The index of current option.
   */
  #shortOpts(index, ...args){
    let opts = args[index]

    for (let i = 1; i < opts.length; i++){
      let opt = opts[i]
      index = this.#shortOpt(index, i, ...args)
    }

    return index
  }

  /**Handle a long option.
   * @param {number} index The index of the long option.
   * @param {...string} args The arguments being parsed.
   * @returns {number} The index of current option.
   * @throws {UserError} If the option is not found.
   */
  #longOpt(index, ...args){
    let name = args[index].substr(2)
    /**@type {ArgOption}*/
    let opt = null

    for (let option of this.#options){
      if (option.long === name){
        opt = option
        break
      }
    }
    if (opt === null) throw UserError.unknownLOpt(name)

    return this.#opt(index, opt, ...args)
  }


  /**Add a command line option/flag to the parser.
   * @param {ArgOption} option 
   * @throws {TypeError} If `option` is not an `ArgOption`.
   * @throws {Error} If `option` is not a valid option.
   */
  addOption(option){
    if (!(option instanceof ArgOption)) throw new TypeError("Illegal Type of \
'option', expected ArgOption.")
    if (!option.valid) throw new Error("Invalid 'option'.")

    this.#options.push(option)
    return this
  }

  /**Create a command line option and add it to the parser.
   * @param {string} short 
   * @param {string} long 
   * @param {RequireEnum} require 
   * @param {function():void} action 
   * @throws {Error} If both `short` and `long` are empty.
   */
  createOption(short, long, require, action){
    let option = new ArgOption()
    if (short === ''){
      if (long === '') throw new Error("Invalid arguments, 'short' and 'long' \
can't both be empty")
      option.setLong(long)
    } else if (long === '') option.setShort(short)
    else option.setShort(short).setLong(long)
    option.setRequire(require).setAction(action)

    this.addOption(option)
    return this
  }

  /**Create a command line flag and add it to the parser.
   * @param {string} short 
   * @param {string} long 
   * @throws {Error} If both `short` and `long` are empty.
   */
  createFlag(short, long){
    let flag
    if (short === ''){
      if (long === '') throw new Error("Invalid arguments, 'short' and 'long' \
can't both be empty")
      flag = new ArgFlag().setLong(long)
    } else if (long === '') flag = new ArgFlag().setShort(short)
    else flag = new ArgFlag().setShort(short).setLong(long)

    this.addOption(flag)
    return this
  }

  /**Set the action that handles the rest of the arguments. 
   * @param {function(...string):void} action
   * @throws {TypeError} If `action` is not a function.
   */
  setArgsAction(action){
    if (typeof action != 'function')throw new TypeError(`Type of 'action' is
${typeof action}, expected function.`)

    this.#argsAction = action
    return this
  }


  /**Get the value of a specific flag. returns `undefined` if flag not found.
   * @param {string} name 
   * @returns {boolean | undefined}
   * @throws {TypeError} If `name` is not a string.
   */
  getFlag(name){
    if (typeof name != 'string') throw new TypeError(`Type of 'name' is
${typeof name}, expected string.`)
    if (name === '') return undefined

    let short = name.length == 1
    for(let option of this.#options){
      if (!(option instanceof ArgFlag)) continue
      let opt = short ? option.short : option.long
      if (opt === name) return option.flag
    }

    //no option found
    return undefined
  }

  /**Reset all the flags to their initial state.*/
  resetFlags(){
    for (let option of this.#options)
      if (option instanceof ArgFlag) option.reset()
    return this
  }

  /**Parse a command with arguments.
   * @param {...string} args 
   */
  parse(...args){
    let rawArgs = []
    for (let i = 1; i < args.length; i++){
      let arg = args[i]
      if (arg.startsWith('--')) i = this.#longOpt(i, ...args)
      else if (arg.startsWith('-')) i = this.#shortOpts(i, ...args)
      else rawArgs.push(arg)
    }
    
    this.#argsAction(...rawArgs)
  }
}

module.exports = {
  RequireEnum: RequireEnum,
  UserError: UserError,
  ArgOption: ArgOption,
  ArgFlag: ArgFlag,
  ArgsParser: ArgsParser
}