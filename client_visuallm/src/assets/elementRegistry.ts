import type { Component, App } from 'vue'
import { getSharedDataUniqueName } from './reactiveData'

export type ProcessedContext = {
  component: Component
  name: string
}

/** The description of element contents.
 *
 *  ## `name`
 *  - unique name of the element on the page
 *  - unique in the context of single component
 *
 *  ## `type`
 *  - type of the element, one of predefined types
 */
export class ElementDescription {
  name!: string;
  type!: string;
}

export function* entries(obj: any) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]]
  }
}

/**
 * Class holding all the elements that can be created from the backend.
 * It also provides utilities for unpacking the element data which arrive
 * from the backend.
 */
export default class ElementRegistry {
  registeredElements: { [id: string]: { [name: string]: any } }

  constructor() {
    this.registeredElements = {}
  }

  createElementDataFromDescription(elementDescr: ElementDescription): {
    component: Component
    data: Map<string, any>
  } {
    if (elementDescr === undefined) {
      throw RangeError('Context is undefined!')
    }
    if (!(elementDescr.type in this.registeredElements)) {
      throw RangeError(`context.type: "${elementDescr.type}" isn't registered in formatter!`)
    }
    let componentDict = this.registeredElements[elementDescr.type]
    let resultDict = {
      component: componentDict.component,
      data: componentDict.process(elementDescr)
    }
    return resultDict
  }

  /** Go over response and create elements from which the component will be
   * made.
   *
   * @param response response from the backend
   * @param reactiveStore
   * @param elements
   */
  retrieveElementsFromResponse(
    response: { elementDescriptions: ElementDescription[] },
    reactiveStore: { [name: string]: any },
    elements: { [name: string]: any } | undefined = undefined
  ) {
    let elementDescriptions = response.elementDescriptions
    for (let i = 0; i < elementDescriptions.length; i++) {
      let elementDescr = elementDescriptions[i]
      let elementData = this.createElementDataFromDescription(elementDescr)
      if (elements !== undefined) {
        elements[elementDescr.name] = {
          component: elementData.component,
          name: elementDescr.name
        }
      }
      for (let [key, data] of entries(elementData.data)) {
        reactiveStore[getSharedDataUniqueName(elementDescr.name, key)] = data
      }
    }
  }

  install(app: App) {
    app.config.globalProperties.$elementRegistry = this
  }
}

/**
 * Check whether the `elementDescr` dictionary contains key `configuration`.
 * If not raise a RangeError exception.
 * @param elementDescr dictionary with all the values specifying the element
 */
export function configurationRequired(elementDescr: {[name: string]: any}) {
  if (!('configuration' in elementDescr)) {
    throw RangeError("Invalid elementDescr ('configuration' not in elementDescr)")
  }
}

export function valuesRequiredInConfiguration(configuration: any, vals: string[]) {
  for (let val of vals) {
    if (!(val in configuration)) {
      throw RangeError(`Invalid configuration! ('${val}' not in configuration)`)
    }
  }
}
