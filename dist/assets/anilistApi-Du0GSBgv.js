import{a as t}from"./index-BOeqtr82.js";const s="https://graphql.anilist.co",n=`
  query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort], $season: MediaSeason, $seasonYear: Int, $status: MediaStatus, $format: MediaFormat) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(type: $type, sort: $sort, season: $season, seasonYear: $seasonYear, status: $status, isAdult: false, format: $format) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        bannerImage
        description
        status
        episodes
        chapters
        volumes
        season
        seasonYear
        averageScore
        popularity
        format
        genres
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`,c=async(a=1,r=20)=>{try{const e={page:a,perPage:r,type:"ANIME",sort:["TRENDING_DESC"]};return(await t.post(s,{query:n,variables:e})).data.data.Page.media}catch(e){return console.error("خطأ في جلب الأنمي الرائج:",e),[]}},p=async(a=1,r=20)=>{try{const e={page:a,perPage:r,type:"ANIME",sort:["POPULARITY_DESC"]};return(await t.post(s,{query:n,variables:e})).data.data.Page.media}catch(e){return console.error("خطأ في جلب الأنمي الأكثر شعبية:",e),[]}},d=async(a=1,r=20)=>{try{const e={page:a,perPage:r,type:"ANIME",sort:["SCORE_DESC"]};return(await t.post(s,{query:n,variables:e})).data.data.Page.media}catch(e){return console.error("خطأ في جلب الأنمي الأعلى تقييماً:",e),[]}},g=async(a=1,r=20)=>{try{const e={page:a,perPage:r,type:"ANIME",sort:["POPULARITY_DESC"],format:"TV"};return(await t.post(s,{query:n,variables:e})).data.data.Page.media}catch(e){return console.error("خطأ في جلب مسلسلات الأنمي:",e),[]}},l=async(a=1,r=20)=>{try{const e={page:a,perPage:r,type:"ANIME",sort:["POPULARITY_DESC"],format:"MOVIE"};return(await t.post(s,{query:n,variables:e})).data.data.Page.media}catch(e){return console.error("خطأ في جلب أفلام الأنمي:",e),[]}},m=async a=>{const r=`
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        bannerImage
        description
        status
        episodes
        chapters
        volumes
        season
        seasonYear
        averageScore
        popularity
        format
        genres
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  `;try{const e={id:a};return(await t.post(s,{query:r,variables:e})).data.data.Media}catch(e){return console.error(`خطأ في جلب تفاصيل الأنمي ${a}:`,e),null}};export{p as a,d as b,g as c,l as d,m as e,c as g};
