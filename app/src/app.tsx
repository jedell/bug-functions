import { useState } from 'https://esm.sh/preact@10.19.3/hooks'
import RecommendationsSelf from './components/recommendations-self'
import './app.css'

export function App() {

  return (
    <div id="app">
      <RecommendationsSelf />
    </div>
  )
}
