export const appConfig = {
  head: {
    title: "SIMASA",
    titleTemplate: '%s | Greatsoft Internship Portal',
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: "Greatsoft Internship Portal" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
      },
    ],
    // Inline script to prevent flash of light theme
    script: [
      {
        innerHTML: `
          (function() {
            try {
              var config = JSON.parse(localStorage.getItem('app-config') || '{}');
              var theme = config.theme || 'system';
              var isDark = false;
              
              if (theme === 'dark') {
                isDark = true;
              } else if (theme === 'system') {
                isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              }
              
              if (isDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        `,
        type: 'text/javascript',
      },
    ],
  },
};
