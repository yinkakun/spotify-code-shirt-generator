import { fabric } from 'fabric';
import { GetServerSideProps } from 'next';
import Marquee from 'react-fast-marquee';
import { useForm } from 'react-hook-form';
import { useWindowSize } from 'react-use';
import { useState, useRef, useEffect } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { getSpotifyData } from '@/pages/api/spotify-link-data';

interface SpotifyLinkData {
  uri: string;
  name: string;
  type: string;
}

interface SpotifyLink {
  spotifyLink: string;
}

const SPOTIFY_LINK_REGEX =
  /^https:\/\/open\.spotify\.com\/(track|album|playlist)\/[a-zA-Z0-9]/;

const SHIRT_SIZES = [
  {
    label: 'Small',
    symbol: 'S',
  },
  {
    label: 'Medium',
    symbol: 'M',
  },
  {
    label: 'Large',
    symbol: 'L',
  },
  {
    label: 'Extra Large',
    symbol: 'XL',
  },
  {
    label: '2XL',
    symbol: '2XL',
  },
];

const SHIRT_COLORS = ['black', 'white'];

const Home = ({ uri, name, type }: SpotifyLinkData) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SpotifyLink>({
    shouldUseNativeValidation: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [spotifyLinkUri, setSpotifyLinkUri] = useState(uri);
  const [spotifyLinkName, setSpotifyLinkName] = useState(name);
  const [spotifyLinkType, setSpotifyLinkType] = useState(type);

  const [shirtSize, setShirtSize] = useState(SHIRT_SIZES[2]);
  const [shirtColor, setShirtColor] = useState(SHIRT_COLORS[0]);

  const onSubmit = async ({ spotifyLink }: SpotifyLink) => {
    setIsLoading(true);
    const SPOTIFY_LINK_DATA_API_URL = `/api/spotify-link-data?link=${spotifyLink}`;
    const response = await fetch(SPOTIFY_LINK_DATA_API_URL);
    const data: SpotifyLinkData = await response.json();

    setIsLoading(false);
    setSpotifyLinkUri(data.uri);
    setSpotifyLinkName(data.name);
    setSpotifyLinkType(data.type);
  };

  const { width: windowWidth } = useWindowSize();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.StaticCanvas | null>(null);

  const insertShirtImage = (url: string) => {
    fabric.Image.fromURL(
      url,
      (img) => {
        img.scaleToWidth(450);
        fabricCanvasRef.current?.insertAt(img, 0, false);
      },
      { crossOrigin: 'Anonymous' },
    );
  };

  const insertSpotifyCodeImage = (url: string) => {
    fabric.Image.fromURL(
      url,
      (img) => {
        img.scaleToWidth(185);
        fabricCanvasRef.current?.centerObject(img).add(img);
      },
      { crossOrigin: 'Anonymous' },
    );
  };

  const saveCanvasAsImage = () => {
    const link = document.createElement('a');
    link.download = `${spotifyLinkName} ${shirtColor} Spotify Code T-Shirt.png`;
    if (fabricCanvasRef.current) {
      link.href = fabricCanvasRef.current?.toDataURL({
        format: 'png',
      });
      link.click();
    }
  };

  useEffect(() => {
    const getSpotifyCodeUrl = () => {
      const barColor = shirtColor === 'white' ? '333333' : 'ffffff';
      return `https://scannables.scdn.co/uri/plain/png/${barColor}/${shirtColor}/600/${spotifyLinkUri}`;
    };

    const spotifyCodeUrl = getSpotifyCodeUrl();

    fabricCanvasRef.current = new fabric.StaticCanvas(canvasRef.current, {
      backgroundColor: 'white',
      width: 450,
      height: 450,
    });

    insertSpotifyCodeImage(spotifyCodeUrl);
    insertShirtImage(`${shirtColor}-shirt.png`);

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [shirtColor, spotifyLinkUri]);

  useEffect(() => {
    const resize = () => {
      if (fabricCanvasRef.current) {
        if (windowWidth <= 500) {
          fabricCanvasRef.current.setZoom(0.75);
          return;
        }

        fabricCanvasRef.current.setZoom(1);
      }
    };
    resize();
    window.addEventListener('resize', () => {
      resize();
    });
  }, [windowWidth]);

  return (
    <div className="flex h-full flex-col bg-white">
      <Marquee
        speed={70}
        pauseOnHover
        gradient={false}
        className="w-full shrink-0 border-y border-black bg-green-600 py-3 text-sm  uppercase leading-none "
      >
        <div className="flex gap-40 px-10 text-white  text-opacity-70">
          <span>Built By Yinka</span>
          <span>Beep boop</span>
          <span>Github Link</span>
          <span>I love Spotify</span>
          <span>Ping Pong</span>
          <span>Not affiliated with Spotify</span>
          <span>Big Bang</span>
        </div>
      </Marquee>
      <div className="container mx-auto flex h-full max-w-screen-xl grow flex-wrap items-center justify-between gap-10 px-4 py-6">
        <div className="flex flex-col overflow-hidden rounded-sm border-2 border-black p-2">
          <canvas ref={canvasRef} />
          <div className="flex items-center justify-between gap-4 rounded-sm bg-zinc-800 px-4 py-3">
            <p className="text-base uppercase text-white">{spotifyLinkName}</p>
            <span className="rounded-full border border-white bg-white bg-opacity-90 px-2 py-[2px] text-xs uppercase tracking-widest">
              {spotifyLinkType}
            </span>
          </div>
        </div>

        <div className="flex max-w-lg flex-col gap-8 lg:gap-10">
          <h1 className="flex flex-col gap-2 text-2xl leading-8 tracking-wider md:text-4xl lg:text-5xl">
            <span>Spotify Code</span> <span>T&#8209;Shirt Generator.</span>
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full">
            <div className="flex w-full flex-col gap-2">
              <label htmlFor="spotify-link" className="flex flex-col text-sm">
                <span>
                  Click the share button on any Spotify song, playlist or album.
                </span>
                <span>Copy the link and paste it here.</span>
              </label>
              <div className="flex gap-6">
                <input
                  id="spotify-link"
                  {...register('spotifyLink', {
                    required: 'Please enter a Spotify link',
                    pattern: {
                      value: SPOTIFY_LINK_REGEX,
                      message: 'Please enter a valid Spotify link',
                    },
                  })}
                  className="flex w-full grow rounded-sm border border-b-2 border-black bg-green-50 px-2 py-2 text-sm text-gray-700  outline-none transition-all duration-300 ease-out placeholder:text-gray-500 focus:bg-green-100"
                  placeholder="Paste Spotify Link here"
                />
                <button
                  type="submit"
                  className="w-[200px] select-none rounded-sm bg-black py-1 px-4 text-xs uppercase tracking-wider text-green-50 duration-500 ease-in-out hover:bg-gray-800"
                >
                  {isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
              <div className="flex h-5 flex-col">
                <ErrorMessage
                  errors={errors}
                  name="spotifyLink"
                  render={({ message }) => (
                    <span className="text-xs text-red-500">{message}</span>
                  )}
                />
              </div>
            </div>
          </form>

          <div className="flex items-center gap-4">
            <span className="flex min-w-[100px] text-sm uppercase">Shirt Color:</span>
            <div className="flex items-center gap-6">
              {SHIRT_COLORS.map((color) => {
                return (
                  <button
                    key={color}
                    onClick={() => setShirtColor(color)}
                    type="button"
                    className={`flex h-5 w-5 rounded-full border border-black  outline-offset-4  ${
                      color === 'white' ? 'bg-white' : 'bg-black'
                    } ${shirtColor === color ? 'outline outline-green-500' : ''}`}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex min-w-[100px] text-sm uppercase">Shirt Size:</span>
            <div className="flex gap-2">
              {SHIRT_SIZES.map(({ symbol, label }, index) => {
                return (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setShirtSize(SHIRT_SIZES[index])}
                    className={`flex h-8 w-10 items-center justify-center rounded-sm border border-gray-800 ${
                      shirtSize.label === label
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    {symbol}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="mb-10 flex w-full select-none items-center justify-center gap-3 rounded-sm border border-black bg-green-600 py-2 px-4 uppercase leading-relaxed tracking-widest text-green-50 transition-colors duration-300 ease-out hover:bg-green-700"
            onClick={saveCanvasAsImage}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const spotifyLink = 'https://open.spotify.com/playlist/75GeX247deNdTX7zdyZDnU';
  const data = await getSpotifyData(spotifyLink);
  const { uri, name, type } = data;

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      uri,
      name,
      type,
    },
  };
};
