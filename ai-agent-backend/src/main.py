from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import asyncio
import threading
import time
from typing import Dict, Any

# Add the ai-agent-source to the path so we can import from it
sys.path.append('/home/ubuntu/ai-agent-source/src')

app = Flask(__name__)
CORS(app, origins="*")

# Global variables to store agent state
agent_status = {
    'running': False,
    'wallet_address': '',
    'xmtp_address': '',
    'last_message': '',
    'message_count': 0
}

# Store for recent messages (in production, use a proper database)
recent_messages = []

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Meeting Scheduler Agent',
        'version': '1.0.0'
    })

@app.route('/agent/status', methods=['GET'])
def get_agent_status():
    """Get current agent status"""
    return jsonify(agent_status)

@app.route('/agent/start', methods=['POST'])
def start_agent():
    """Start the AI agent (placeholder - actual agent runs separately)"""
    # In a real implementation, this would start the XMTP agent
    # For now, we'll just update the status
    agent_status['running'] = True
    agent_status['wallet_address'] = 'Agent wallet address will be shown here'
    agent_status['xmtp_address'] = 'XMTP address will be shown here'
    
    return jsonify({
        'message': 'Agent start command received',
        'status': agent_status
    })

@app.route('/agent/stop', methods=['POST'])
def stop_agent():
    """Stop the AI agent"""
    agent_status['running'] = False
    return jsonify({
        'message': 'Agent stopped',
        'status': agent_status
    })

@app.route('/messages', methods=['GET'])
def get_recent_messages():
    """Get recent messages processed by the agent"""
    return jsonify({
        'messages': recent_messages[-10:],  # Last 10 messages
        'total_count': len(recent_messages)
    })

@app.route('/messages', methods=['POST'])
def add_message():
    """Add a message (for testing purposes)"""
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    message_entry = {
        'timestamp': time.time(),
        'sender': data.get('sender', 'unknown'),
        'message': data['message'],
        'response': data.get('response', 'No response generated')
    }
    
    recent_messages.append(message_entry)
    agent_status['message_count'] = len(recent_messages)
    agent_status['last_message'] = data['message']
    
    return jsonify({
        'message': 'Message added successfully',
        'entry': message_entry
    })

@app.route('/contract/info', methods=['GET'])
def get_contract_info():
    """Get smart contract information"""
    return jsonify({
        'contract_address': '0x0871E02Ea98fd5E495201A76F651029cAfbAdCBC',
        'network': 'Base Mainnet',
        'features': [
            'Meeting scheduling',
            'Escrow payments',
            'Automated refunds',
            'Host pricing management'
        ]
    })

@app.route('/docs', methods=['GET'])
def get_documentation():
    """Get API documentation"""
    return jsonify({
        'endpoints': {
            'GET /': 'Health check',
            'GET /agent/status': 'Get agent status',
            'POST /agent/start': 'Start the AI agent',
            'POST /agent/stop': 'Stop the AI agent',
            'GET /messages': 'Get recent messages',
            'POST /messages': 'Add a message (testing)',
            'GET /contract/info': 'Get smart contract info',
            'GET /docs': 'This documentation'
        },
        'description': 'AI Meeting Scheduler Agent Backend API',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    # In production, the AI agent would run in a separate process
    # This Flask app serves as a REST API interface to monitor and control the agent
    print("Starting AI Meeting Scheduler Backend API...")
    print("Note: The actual XMTP AI agent should be run separately using:")
    print("cd /home/ubuntu/ai-agent-source && npm start")
    
    app.run(host='0.0.0.0', port=5000, debug=False)

