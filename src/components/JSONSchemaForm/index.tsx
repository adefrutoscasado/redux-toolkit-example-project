import JSONSchemaForm from '@rjsf/core'
import cn from 'classnames'
import React, { useState } from 'react'
import { Button, Spinner, Alert } from './../../components/bootstrap'

export const flatten = (obj, keySeparator = '.') => {
  const flattenRecursive = (obj, parentProperty, propertyMap = {}) => {
    for(const [key, value] of Object.entries(obj)){
      const property = parentProperty ? `${parentProperty}${keySeparator}${key}` : key
      if(value && typeof value === 'object'){
        flattenRecursive(value, property, propertyMap)
      } else {
        propertyMap[property] = value
      }
    }
    return propertyMap
  }
  return flattenRecursive(obj, undefined, undefined)
}

const getJsonSchemaByKey = (jsonSchema, path: string, pathSeparator = '.') => {
  const paths = path.split(pathSeparator)
  let current = jsonSchema as any

  for (let i = 0; i < paths.length; ++i) {
    current = current?.properties || current
    if (current[paths[i]] == undefined) {
      return undefined
    } else {
      current = current[paths[i]]
    }
  }
  return current
}


const addDefaultValues = (jsonSchemaProperties, defaultValues) => {
  const jsonSchemaPropertiesClone = JSON.parse(JSON.stringify(jsonSchemaProperties))
  Object.entries(flatten(defaultValues)).forEach(([propertyName, propertyValue]) => {
    const schema = getJsonSchemaByKey(jsonSchemaPropertiesClone, propertyName)
    if (schema) schema.default = propertyValue
  })
  return jsonSchemaPropertiesClone
}

const SubmitButton = ({ isFetching, label }) => (
  <span
    className={cn(
      'form-submit-button',
      isFetching && 'is-fetching'
    )}
  >
    {label}
  </span>
)

const JSONSchemaForm_ = ({
  onSubmit = f => f,
  schema = {} as any,
  defaultValues = {},
  title = '' as string,
  isFetching = false,
  label = 'Submit',
  error = null as any,
  ...props
}) => {
  const [ currentValues, setCurrentValues ] = useState()

  const _onSubmit = ({formData}) => {
    onSubmit(formData)
  }

  const processedSchema = {
    ...schema,
    properties: addDefaultValues(schema.properties, currentValues || defaultValues),
    title: title || schema.title
  }

  const onChange = ({formData}) => {
    setCurrentValues(formData)
  }

  return (
    <JSONSchemaForm
      {...props}
      onChange={onChange}
      onSubmit={_onSubmit}
      schema={processedSchema}
    >
      <Button
        type="submit"
        variant={'primary'}
        disabled={isFetching}
      >
        {isFetching && (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <SubmitButton {...{ isFetching, label }} />
          </>
        )}
        {!isFetching && (
          <SubmitButton {...{ isFetching, label }} />
        )}
      </Button>
      {(error && !isFetching) &&
        <Alert variant={'danger'}>
          {JSON.stringify(error)}
        </Alert>
      }
    </JSONSchemaForm>
  )
}

export default JSONSchemaForm_
