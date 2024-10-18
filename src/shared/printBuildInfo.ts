const printBuildInfo = () =>
  console.log(`
 _____        _   __  _             ___  _____ 
/  ___|      | | / _|| |           / _ \\|_   _|
\\ \`--.   ___ | || |_ | |_  _   _  / /_\\ \\ | |  
 \`--. \\ / _ \\| ||  _|| __|| | | | |  _  | | |  
/\\__/ /|  __/| || |  | |_ | |_| | | | | |_| |_ 
\\____/  \\___||_||_|   \\__| \\__, | \\_| |_/\\___/ 
                            __/ |              
                           |___/       
                           

v${chrome.runtime.getManifest().version} - Use your LLM models on any website

Website: https://selftyai.com?ref=extension_info
Source code: https://github.com/selftyai/selftyai
Report a bug: https://github.com/selftyai/selftyai/issues`)

export default printBuildInfo
