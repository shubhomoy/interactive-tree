import React from 'react';
import Plot from './components/Plot2'
import Classes from './components/Classes'
import Announcement from './components/Announcement'
import MouseTooltip from 'react-sticky-mouse-tooltip';
import './App.css';

const plot_height = 40
const plot_width = 40

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            'activeClass': null,
            'classes': []
        }
    }

    setActiveClass = (cls) => {
        this.setState({
            activeClass: cls
        })
    }

    updateClasses = (classes) => {
        this.setState({
            classes: classes
        })
    }

  render() {
    return (
        <div className="container">
                <div className="left-pane">
                    <div className="spacer"></div>
                    <div className="row">
                        <div className="col-12">
                            <div className="row">
                                <div className="col-12">
                                    <Plot 
                                        width={plot_width} 
                                        height={plot_height}
                                        classes={this.state.classes}
                                        activeClass={this.state.activeClass} />
                                </div>
                            </div>

                            {/* <div className="row">
                                <div className="col-12">
                                    <Announcement />
                                </div>
                            </div> */}

                            <div className="row">
                                <div className="col-12">
                                    <Classes 
                                        data={this.state.data}
                                        onClassUpdate={this.updateClasses}
                                        onSelectedActiveClass={this.setActiveClass}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* <div className="right-pane">
                    <div className="row" style={{height: "100%"}}>
                        <div className="col-12">
                            <div className="row">
                                <div className="col-12-sm">
                                    <h1 className="site-title">Interactive Decision Trees</h1>
                                </div>
                            </div>
                            <Dataset 
                                data={this.state.data} 
                                subdata={this.state.sub_data} 
                                dataset={this.state.dataset} 
                                classes={this.state.classes}
                                clearSplitState={this.state.clear_split} 
                                onSplitSelected={this.getSplits} 
                                onClearClassification={this.clearSplits}
                                onPreview={this.previewSplit}
                                onPreviewSplit={this.previewSplitLine}
                                onClearPreview={this.clearPreview}
                                onUpdateClearSplitState={this.updateClearSplitState} />

                            {this.state.showMoreNodesPopup ? this.showNodePopup(): null}
                        </div>
                    </div>
                    <Footer />
                </div> */}



            
        </div>
    );
  }
  
}

export default App;
