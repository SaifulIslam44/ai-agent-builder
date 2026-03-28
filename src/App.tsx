import { useState, useEffect } from 'react'
import './App.css'

// Define the types based on data.json
interface AgentProfile {
  id: string
  name: string
  description: string
}

interface Skill {
  id: string
  name: string
  category: string
  description: string
}

interface Layer {
  id: string
  name: string
  type: string
  description: string
}

interface AgentData {
  agentProfiles: AgentProfile[]
  skills: Skill[]
  layers: Layer[]
}

interface SavedAgent {
  name: string
  profileId: string
  skillIds: string[]
  layerIds: string[]
  provider?: string
}

function App() {
  const [data, setData] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selection states
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedLayers, setSelectedLayers] = useState<string[]>([])

  // Saving states
  const [agentName, setAgentName] = useState('')
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')

  //newly added saiful islam
  const [showToast, setShowToast] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nameError, setNameError] = useState(false)

  const handleDeleteAgent = (indexToRemove: number) => {
    const updatedAgents = savedAgents.filter((_, index) => index !== indexToRemove)
    setSavedAgents(updatedAgents)
    localStorage.setItem('savedAgents', JSON.stringify(updatedAgents))
  }

  const [sessionTime, setSessionTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Load saved agents from local storage on component mount
    const saved = localStorage.getItem('savedAgents')
    if (saved) {
      try {
        setSavedAgents(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved agents', e)
      }
    }
  }, [])

  useEffect(() => {
    const analyticsInterval = setInterval(() => {
      if (agentName !== '') {
        console.log(`[Analytics Heartbeat] User is working on agent named: "${agentName}"`)
      } else {
        console.log(`[Analytics Heartbeat] User is working on an unnamed agent draft...`)
      }
    }, 8000)

    return () => clearInterval(analyticsInterval)
  }, [])

  const fetchAPI = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate network delay and randomness (1 to 3 seconds)
      const delay = Math.floor(Math.random() * 2000) + 1000
      await new Promise((resolve) => setTimeout(resolve, delay))

      const response = await fetch('/data.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const jsonData: AgentData = await response.json()
      setData(jsonData)
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to fetch agent data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on initial component mount
  useEffect(() => {
    fetchAPI()
  }, [])

  const handleLayerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const layerId = e.target.value;
    if (layerId && !selectedLayers.includes(layerId)) {
      selectedLayers.push(layerId)
      setSelectedLayers(selectedLayers)
    }
    e.target.value = ""; // Reset dropdown

    fetchAPI()
  }

  const handleSkillSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skillId = e.target.value;
    if (skillId && !selectedSkills.includes(skillId)) {
      setSelectedSkills([...selectedSkills, skillId]);
    }
    e.target.value = ""; // Reset dropdown

    fetchAPI()
  }

const handleSaveAgent = () => {
    if (!agentName.trim()) {
      setNameError(true)
      return
    }

    const newAgent: SavedAgent = {
      name: agentName,
      profileId: selectedProfile,
      skillIds: selectedSkills,
      layerIds: selectedLayers,
      provider: selectedProvider,
    }

    const updatedAgents = [...savedAgents, newAgent]
    setSavedAgents(updatedAgents)
    localStorage.setItem('savedAgents', JSON.stringify(updatedAgents))
    setAgentName('')
    setNameError(false)

    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const handleLoadAgent = (agent: SavedAgent) => {
    setSelectedProfile(agent.profileId || '')
    setSelectedSkills(agent.skillIds || [])
    setSelectedLayers([...(agent.layerIds || [])])
    setAgentName(agent.name)
    setSelectedProvider(agent.provider || '')
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Agent Builder</h1>
        <p>Design your custom AI personality and capability set.</p>
        <div className="header-controls">
          <button onClick={fetchAPI} disabled={loading}>
            {loading ? 'Fetching Configuration...' : 'Reload Configuration Data'}
          </button>
          <span className="session-text">
            Session Active: {sessionTime}s
          </span>
        </div>
      </header>

      <main className="main-content">
        <div className="layout-row">
          {/* Left pane: Selections */}
          <section className="left-pane">
            <h2>Configuration Options</h2>
            {error && <div className="error-text">Error: {error}</div>}

            {loading && (
              <div className="loading-box">
                Fetching simulated API... (this takes 1-3 seconds to test loading states)
              </div>
            )}

            {!data && !loading && !error && <p>No data loaded.</p>}

            {data && (
              <div className="form-group-container">
                <div>
                  <label htmlFor="profile-select" className="label-bold">Base Profile:</label>
                  <select
                    id="profile-select"
                    value={selectedProfile}
                    onChange={(e) => {
                      setSelectedProfile(e.target.value)
                      fetchAPI()
                    }}
                    className="select-full"
                  >
                    <option value="">-- Select a Profile --</option>
                    {data.agentProfiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="skill-select" className="label-bold">Add Skill:</label>
                  <select
                    id="skill-select"
                    onChange={handleSkillSelect}
                    defaultValue=""
                    className="select-full"
                  >
                    <option value="" disabled>-- Select a Skill to Add --</option>
                    {data.skills.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="layer-select" className="label-bold">Add Personality Layer:</label>
                  <select
                    id="layer-select"
                    onChange={handleLayerSelect}
                    defaultValue=""
                    className="select-full"
                  >
                    <option value="" disabled>-- Select a Layer to Add --</option>
                    {data.layers.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="provider-select" className="label-bold">AI Provider:</label>
                  <select
                    id="provider-select"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="select-full"
                  >
                    <option value="">-- Select an AI Provider --</option>
                    {['Gemini', 'ChatGPT', 'Kimi', 'Claude', 'DeepSeek'].map((provider) => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>

          {/* Right pane: Selected configuration preview */}
          <section className="right-pane">
            <h2>Current Agent Configuration</h2>

            <div className="preview-container">
              <h3 className="margin-top-0">Profile</h3>
              {selectedProfile && data ? (
                <p className="list-item list-item-block">
                  <strong>{data.agentProfiles.find(p => p.id === selectedProfile)?.name}</strong>:
                  {' '}{data.agentProfiles.find(p => p.id === selectedProfile)?.description}
                </p>
              ) : (
                <p className="text-muted">No profile selected.</p>
              )}

              <h3>Selected Skills</h3>
              {selectedSkills.length > 0 && data ? (
                <ul className="list-padded">
                  {selectedSkills.map(skillId => {
                    const skill = data.skills.find(s => s.id === skillId);
                    return (
                      <li key={skillId} className="list-item">
                        {skill?.name}
                        <button
                          onClick={() => setSelectedSkills(selectedSkills.filter(id => id !== skillId))}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-muted">No skills added.</p>
              )}

              <h3>Selected Layers</h3>
              {selectedLayers.length > 0 && data ? (
                <ul className="list-padded">
                  {selectedLayers.map(layerId => {
                    const layer = data.layers.find(l => l.id === layerId);
                    return (
                      <li key={layerId} className="list-item">
                        {layer?.name}
                        <button
                          onClick={() => setSelectedLayers(selectedLayers.filter(id => id !== layerId))}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-muted">No layers added.</p>
              )}

              <h3>Selected Provider</h3>
              {selectedProvider ? (
                <p className="list-item">
                  {selectedProvider}
                  </p>
              ) : (
                <p className="text-muted">No provider selected.</p>
              )}

              <div className="save-section">
  <h3 className="margin-top-0">Save This Agent</h3>
  <div className="save-input-group">
    <input
      type="text"
      placeholder="Enter agent name..."
      value={agentName}
      onChange={e => {
        setAgentName(e.target.value)
        if (e.target.value.trim()) setNameError(false)
      }}
      className={`input-flex ${nameError ? 'input-error' : ''}`}
    />
    <button onClick={handleSaveAgent} className="btn-save">
      Save Agent
    </button>
  </div>
  {nameError && <p className="error-message-small">Agent name is required!</p>}
</div>
            </div>
          </section>
        </div>

        {/* Bottom Panel: Saved Agents */}
        {savedAgents.length > 0 && (
          <section className="saved-agents-container">
            <div className="saved-agents-header">
              <h2 className="margin-0">Saved Agents</h2>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="btn-clear"
              >
                Clear All
              </button>
            </div>
            <div className="agents-grid">
              {savedAgents.map((agent, index) => (
                <div key={index} className="agent-card">
                  <h3 className="agent-card-title">{agent.name}</h3>
                  <p className="agent-card-text">
                    <strong>Profile:</strong> {data?.agentProfiles.find(p => p.id === agent.profileId)?.name || 'None Selected'}
                  </p>
                  <p className="agent-card-text">
                    <strong>Skills:</strong> {agent.skillIds?.length || 0} included
                  </p>
                  <p className="agent-card-text">
                    <strong>Layers:</strong> {agent.layerIds?.length || 0} included
                  </p>
                  <p className="agent-card-text">
                    <strong>Provider:</strong> {agent.provider || 'None'}
                  </p>
                  <div className="card-actions">
                    <button
                      onClick={() => handleLoadAgent(agent)}
                      className="btn-load"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(index)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      {/* ১. Save Success Toast */}
      {showToast && (
        <div className="custom-toast">
          <div className="toast-content">
            <span className="toast-icon">✅</span>
            <p>Agent saved successfully!</p>
          </div>
          <button className="toast-exit" onClick={() => setShowToast(false)}>
            Exit
          </button>
        </div>
      )}

      {/* ২. Clear All Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <h3>Are you sure?</h3>
            <p>Do you want to clear all saved agents? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={() => {
                  setSavedAgents([])
                  localStorage.removeItem('savedAgents')
                  setShowConfirmModal(false)
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App