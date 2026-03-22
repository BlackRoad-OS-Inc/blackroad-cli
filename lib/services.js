// Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved.
// BlackRoad OS Service Registry — real infrastructure, no fiction

export const services = {
  core: [
    { name: 'Main Site', slug: 'blackroad', url: 'blackroad.io', railway: false },
    { name: 'App Console', slug: 'app', url: 'app.blackroad.io', railway: false },
    { name: 'API', slug: 'api', url: 'api.blackroad.io', railway: false },
    { name: 'Auth', slug: 'auth', url: 'auth.blackroad.io', railway: false },
    { name: 'Search', slug: 'search', url: 'search.blackroad.io', railway: false },
  ],
  infrastructure: [
    { name: 'Prism Console', slug: 'prism', url: 'prism.blackroad.io', railway: false },
    { name: 'Status', slug: 'status', url: 'status.blackroad.io', railway: false },
    { name: 'Images CDN', slug: 'images', url: 'images.blackroad.io', railway: false },
    { name: 'RoundTrip Chat', slug: 'roundtrip', url: 'roundtrip.blackroad.io', railway: false },
    { name: 'HQ Metaverse', slug: 'hq', url: 'hq.blackroad.io', railway: false },
  ],
  products: [
    { name: 'Homework', slug: 'homework', url: 'homework.blackroad.io', railway: false },
    { name: 'RoadPay', slug: 'roadpay', url: 'roadpay.blackroad.io', railway: false },
    { name: 'Brand Kit', slug: 'brand', url: 'brand.blackroad.io', railway: false },
    { name: 'Docs', slug: 'docs', url: 'docs.blackroad.io', railway: false },
    { name: 'Operator', slug: 'operator', url: 'blackroad-operator.pages.dev', railway: false },
  ],
  domains: [
    { name: 'blackroad.io', slug: 'blackroad-io', url: 'blackroad.io', railway: false },
    { name: 'blackroad.company', slug: 'blackroad-company', url: 'blackroad.company', railway: false },
    { name: 'blackroad.me', slug: 'blackroad-me', url: 'blackroad.me', railway: false },
    { name: 'blackroad.network', slug: 'blackroad-network', url: 'blackroad.network', railway: false },
    { name: 'blackroad.systems', slug: 'blackroad-systems', url: 'blackroad.systems', railway: false },
    { name: 'blackroadai.com', slug: 'blackroadai-com', url: 'blackroadai.com', railway: false },
    { name: 'blackroadinc.us', slug: 'blackroadinc-us', url: 'blackroadinc.us', railway: false },
    { name: 'blackroadqi.com', slug: 'blackroadqi-com', url: 'blackroadqi.com', railway: false },
    { name: 'blackroadquantum.com', slug: 'blackroadquantum-com', url: 'blackroadquantum.com', railway: false },
    { name: 'lucidia.earth', slug: 'lucidia-earth', url: 'lucidia.earth', railway: false },
    { name: 'lucidia.studio', slug: 'lucidia-studio', url: 'lucidia.studio', railway: false },
    { name: 'lucidiaqi.com', slug: 'lucidiaqi-com', url: 'lucidiaqi.com', railway: false },
    { name: 'roadchain.io', slug: 'roadchain-io', url: 'roadchain.io', railway: false },
    { name: 'roadcoin.io', slug: 'roadcoin-io', url: 'roadcoin.io', railway: false },
    { name: 'blackboxprogramming.io', slug: 'blackboxprogramming-io', url: 'blackboxprogramming.io', railway: false },
  ],
  fleet: [
    { name: 'Alice (Pi)', slug: 'alice', url: '192.168.4.49', railway: false, local: true },
    { name: 'Cecilia (Pi)', slug: 'cecilia', url: '192.168.4.96', railway: false, local: true },
    { name: 'Octavia (Pi)', slug: 'octavia', url: '192.168.4.101', railway: false, local: true },
    { name: 'Lucidia (Pi)', slug: 'lucidia', url: '192.168.4.38', railway: false, local: true },
    { name: 'Gematria (DO)', slug: 'gematria', url: 'gematria.blackroad.io', railway: false },
  ],
};

export const getAllServices = () => {
  return [
    ...services.core,
    ...services.infrastructure,
    ...services.products,
    ...services.domains,
  ];
};

export const getServiceBySlug = (slug) => {
  const all = [...getAllServices(), ...services.fleet];
  return all.find(s => s.slug === slug);
};

export const getRailwayServices = () => {
  return getAllServices().filter(s => s.railway);
};

export const getLocalServices = () => {
  return services.fleet;
};

export const dashboards = {
  cloudflare: 'https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a',
  github: 'https://github.com/BlackRoad-OS-Inc',
  gitea: 'http://192.168.4.101:3100',
  status: 'https://status.blackroad.io',
};
