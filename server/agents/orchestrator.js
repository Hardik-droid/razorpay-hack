import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

class MasterOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.agentRuns = [];
    this.activeSubscribers = new Set();
    this.agentStatuses = {
      INGEST: { status: 'IDLE', lastRun: null, totalParsed: 4 },
      INTEGRITY: { status: 'MONITORING', lastRun: null, activeDiscrepancies: 3 },
      VISIBILITY: { status: 'EVALUATED', lastRun: null, currentGeoScore: 54 },
      OUTREACH: { status: 'LISTENING', lastRun: null, qualifiedCarts: 2 },
      PAYMASTER: { status: 'ARMED', lastRun: null, successfulTxs: 1, guardedTxs: 0 },
    };
  }

  logEvent(agentType, action, details, level = 'INFO') {
    const event = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      agentType,
      action,
      details,
      level,
    };

    this.agentRuns.unshift(event);
    if (this.agentRuns.length > 200) this.agentRuns.pop();

    if (this.agentStatuses[agentType]) {
      this.agentStatuses[agentType].status = level === 'ERROR' ? 'ALERT' : 'ACTIVE';
      this.agentStatuses[agentType].lastRun = event.timestamp;
    }

    this.emit('agent_event', event);
    this.broadcastToSSE(event);
    return event;
  }

  addSSESubscriber(res) {
    this.activeSubscribers.add(res);
    res.on('close', () => {
      this.activeSubscribers.delete(res);
    });
  }

  broadcastToSSE(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of this.activeSubscribers) {
      try {
        client.write(payload);
      } catch (err) {
        this.activeSubscribers.delete(client);
      }
    }
  }

  getSystemOverview() {
    return {
      agentStatuses: this.agentStatuses,
      recentEvents: this.agentRuns.slice(0, 50),
      totalSubscribers: this.activeSubscribers.size,
    };
  }
}

export const orchestrator = new MasterOrchestrator();
