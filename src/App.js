import React from 'react';
import Plot from './components/Plot'
import Footer from './components/Footer'
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      'plot_width': 40,
      'plot_height': 40
    }
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12-sm">
            <h1 className="site-title">Interactive Decision Trees</h1>
          </div>
        </div>
        
        <Plot width={this.state.plot_width} height={this.state.plot_height} />

        <Footer />
      </div>
    );
  }
  
}

export default App;
