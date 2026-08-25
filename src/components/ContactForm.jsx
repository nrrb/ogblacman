import { Fragment, useState } from 'react'

export default function ContactForm({ content, idPrefix }) {
  const [submitted, setSubmitted] = useState(false)
  const fieldId = (field) => `${idPrefix}-${field.id}`

  function submit(event) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    setSubmitted(true)
  }

  return (
    <div className="contact-form">
      {!submitted ? (
        <form onSubmit={submit}>
          {content.fields.map((field) => (
            <Fragment key={field.id}>
              <label htmlFor={fieldId(field)} className="form-label">
                {field.label}
                {field.required && <span className="form-required"> {content.required_marker}</span>}
              </label>
              <input
                id={fieldId(field)}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
                className={`form-control${field.multiline ? ' form-control--message' : ''}`}
              />
            </Fragment>
          ))}
          <input type="submit" data-wait={content.wait_label} className="form-submit" value={content.submit_label} />
        </form>
      ) : (
        <div className="form-status form-status--success">
          <div>{content.success_message}</div>
        </div>
      )}
      <div className="form-status form-status--error">
        <div className="form-status__message">{content.error_message}</div>
      </div>
    </div>
  )
}
