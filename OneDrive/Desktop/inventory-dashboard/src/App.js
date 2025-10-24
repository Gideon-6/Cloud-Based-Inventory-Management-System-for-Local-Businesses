import React from 'react';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Dashboard from './Dashboard'; // Make sure this path is correct

function App({ signOut, user }) {
  return (
    <div style={{ padding: '20px' }}> {/* Added some padding */}
      <Heading level={1}>Inventory Dashboard</Heading>
      <Heading level={5}>Welcome, {user.username}!</Heading>
      
      <Button onClick={signOut} variation="primary" style={{ marginTop: '10px' }}>
        Sign Out
      </Button>

      <hr style={{ margin: '20px 0' }} />

      {/* Your main Dashboard component */}
      <Dashboard />
    </div>
  );
}

export default withAuthenticator(App);