interface Props {
  title?: string
  labels?: string[]
  body?: string
}

export default function getIssueRedirect({ body, title, labels }: Props) {
  const searchParams = new URLSearchParams()

  if (labels) searchParams.append('labels', labels.join(','))
  if (title) searchParams.append('title', title)
  if (body) searchParams.append('body', body)

  return `https://github.com/selftyai/selftyai/issues/new?${searchParams.toString()}`
}
