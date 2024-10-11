export const setTheme = (theme: string) => {
  localStorage.setItem('theme', theme)
}

export const getTheme = () => {
  return localStorage.getItem('theme')
}
