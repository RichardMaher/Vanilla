class GlobalStateManager 
{
  #singleton;
  #bucket = {
      color: "green",
	  pageContainer: null,
	  pageStack: []
  };

  constructor() {
    if (this.#singleton) {
    	return this.#singleton
    }

    this.#singleton = this;
  }

  getItem(name) {
    return this.#bucket[name];
  }

  setItem(name, value) {
    this.#bucket[name] = value;
  }
  
}

let globalState = Object.freeze(new GlobalStateManager());

export default globalState;