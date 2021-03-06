import { parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../services/api'
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString'
import styles from './home.module.scss'
import IEpisode from '../protocols/IEpisode'
import { usePlayer } from '../contexts/PlayerContext'

type HomeProps = {
  latestEpisodes: Array<IEpisode>
  allEpisodes: Array<IEpisode>
}

export default function Home({ allEpisodes, latestEpisodes }: HomeProps) {
  // useEffect(() => {
  //   fetch('http://localhost:3333/episodes')
  //     .then((response) => response.json())
  //     .then((data) => console.log(data))
  // }, [])

  const episodeList = [...latestEpisodes, ...allEpisodes]

  const { playList } = usePlayer()
  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>
        <ul>
          {latestEpisodes.map((episode: IEpisode, index: number) => (
            <li key={episode.id}>
              <Image
                width={192}
                height={192}
                objectFit="cover"
                src={episode.thumbnail}
                alt={episode.title}
              />
              <div className={styles.episodeDetails}>
                <Link href={`/episodes/${episode.id}`}>
                  <a>{episode.title}</a>
                </Link>
                <p>{episode.members}</p>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playList(episodeList, index)
                }}
              >
                <img src="/play-green.svg" alt="Tocar episodio" />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode: IEpisode, index: number) => (
              <tr key={episode.id}>
                <td style={{ width: 72 }}>
                  <Image
                    width={120}
                    height={120}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                  />
                </td>
                <td>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                </td>
                <td>{episode.members}</td>
                <td style={{ width: 100 }}>{episode.publishedAt}</td>
                <td>{episode.durationAsString}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => {
                      playList(episodeList, index + latestEpisodes.length)
                    }}
                  >
                    <img src="/play-green.svg" alt="Tocar episódio" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

// export async function getServerSideProps() {
export const getStaticProps: GetStaticProps = async () => {
  // const response = await fetch('http://localhost:3333/episodes?_limit=12&_sort=published_at&_order=desc')
  // const data = await response.json()

  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes: IEpisode[] = data.map((episode) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
        locale: ptBR
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(
        Number(episode.file.duration)
      ),
      url: episode.file.url
    }
  })

  const latestEpisodes: IEpisode[] = episodes.slice(0, 2)
  const allEpisodes: IEpisode[] = episodes.slice(2, episodes.length)

  return {
    // props: {
    //   episodes: data
    // }
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8
  }
}
