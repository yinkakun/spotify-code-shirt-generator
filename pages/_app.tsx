import { AppProps } from 'next/app';
import { Fragment } from 'react';
import { DefaultSeo } from 'next-seo';
import '@styles/tailwind.css';
import '@styles/global.css';

const SpotifyCodeShirt = ({ Component, pageProps }: AppProps) => (
  <Fragment>
    <DefaultSeo title="SpotiMerch" />
    <Component {...pageProps} />
  </Fragment>
);

export default SpotifyCodeShirt;
