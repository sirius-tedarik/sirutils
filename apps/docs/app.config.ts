export default defineAppConfig({
  shadcnDocs: {
    site: {
      name: 'sirutils',
      description: 'Utilities we use in sirius',
    },
    theme: {
      customizable: true,
      color: 'red',
      radius: 0.5,
    },
    header: {
      title: 'Sirutils',
      showTitle: true,
      darkModeToggle: true,
      logo: {
        light: '/logo.svg',
        dark: '/logo-dark.svg',
      },
      nav: [],
      links: [
        {
          icon: 'lucide:github',
          to: 'https://github.com/sirius-tedarik/sirutils',
          target: '_blank',
        },
      ],
    },
    aside: {
      useLevel: true,
      collapse: false,
    },
    main: {
      breadCrumb: true,
      showTitle: true,
      padded: true,
    },
    footer: {
      credits: 'Copyright © 2024',
      links: [
        {
          icon: 'lucide:github',
          to: 'https://github.com/sirius-tedarik/sirutils',
          target: '_blank',
        },
      ],
    },
    toc: {
      enable: true,
      title: 'On This Page',
      links: [
        {
          title: 'Star on GitHub',
          icon: 'lucide:star',
          to: 'https://github.com/sirius-tedarik/sirutils',
          target: '_blank',
        },
        {
          title: 'Create Issues',
          icon: 'lucide:circle-dot',
          to: 'https://github.com/sirius-tedarik/sirutils/issues',
          target: '_blank',
        },
      ],
    },
    search: {
      enable: true,
      inAside: false,
    },
  },
})
