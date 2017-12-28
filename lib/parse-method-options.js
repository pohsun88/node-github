module.exports = parseMethodOptions

const errors = require('./utils/errors')

function parseMethodOptions (options, methodParams) {
  Object.keys(methodParams).forEach(paramName => {
    const paramDefinition = methodParams[paramName]
    const expectedType = paramDefinition.type
    let value = options[paramName]

    const paramIsPresent = paramName in options
    const paramIsNull = value === null

    if (!paramDefinition.required && !paramIsPresent) {
      return
    }

    if (paramDefinition['allow-null'] === true && paramIsNull) {
      return
    }

    if ((paramDefinition.required && !paramIsPresent) ||
        (paramDefinition['allow-null'] === false && paramIsNull)) {
      throw new errors.BadRequest(`Empty value for parameter '${paramName}': ${value}`)
    }

    if (paramDefinition.validation) {
      const regex = new RegExp(paramDefinition.validation)
      if (!regex.test(value)) {
        throw new errors.BadRequest(`Invalid value for parameter '${paramName}': ${value}`)
      }
    }

    if (expectedType === 'number') {
      value = parseInt(value, 10)
      if (isNaN(value)) {
        throw new errors.BadRequest(`Invalid value for parameter '${paramName}': ${options[paramName]} is NaN`)
      }
    }

    if (expectedType === 'json' && typeof value === 'string') {
      try {
        value = JSON.parse(value)
      } catch (exception) {
        throw new errors.BadRequest(`JSON parse error of value for parameter '${paramName}': ${value}`)
      }
    }

    if (expectedType === 'date') {
      value = new Date(value)
    }

    options[paramName] = value
  })

  return options
}