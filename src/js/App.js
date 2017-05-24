import React from 'react';
import ReactDom from 'react-dom';
import CloudExplorer from './CloudExplorer';

const STORAGE_KEY_PATH = 'CloudExplorer.path';

/**
 * @class in charge of the history and init of the main CloudExplorer component
 */
class App extends React.Component {
  hash = null
  state = {
    path: [],
    pickFolder: false,
    onCancel: null,
    onPick: null,
    onError: null,
  }
  loadHistory() {
    const path = localStorage.getItem(STORAGE_KEY_PATH);
    if(path && path !== this.state.path) {
      this.setState({
        path: JSON.parse(path),
      });
    }
  }
  onChange(path) {
    if(path !== this.state.path) {
      this.setState({
        path: path,
      });
    }
    localStorage.setItem(STORAGE_KEY_PATH, JSON.stringify(path));
  }
  componentWillMount() {
    this.loadHistory();
  }
  ////////////////////
  // class methods
  ////////////////////
  constructor() {
    super();
    window.ce = this;
  }
  onCloudExplorerReady(cloudExplorer) {
    this.cloudExplorer = cloudExplorer || this.cloudExplorer;
  }
  createBlob(path, file) {
    return Object.assign({}, file, {
      folder: this.cloudExplorer.unifile.getPath(path),
      path: this.cloudExplorer.unifile.getPath(path.concat(file.name)),
      url: this.cloudExplorer.unifile.getUrl(path.concat(file.name)),
      service: path[0],
    });
  }
  fromBlobToPath(blob) {
    return [blob.service, ...blob.path.split('/').filter(file => file != '')];
  }
  read(blob) {
    return this.cloudExplorer.unifile.read(this.fromBlobToPath(blob));
  }
  write(data, blob) {
    return this.cloudExplorer.unifile.write(data, this.fromBlobToPath(blob));
  }
  ////////////////////
  // API
  ////////////////////
  openFile() {
    return new Promise((resolve, reject) => {
      this.setState({
        pickFolder: false,
        multiple: false,
        inputName: false,
        onCancel: () => resolve(null),
        onPick: files => resolve(this.createBlob(this.state.path, files[0])),
        onSave: null,
        onError: e => reject(e),
      });
    });
  }
  openFiles() {
    return new Promise((resolve, reject) => {
      this.setState({
        pickFolder: false,
        multiple: true,
        inputName: false,
        onCancel: () => resolve(null),
        onPick: files => resolve(files.map(file => this.createBlob(this.state.path, file))),
        onSave: null,
        onError: e => reject(e),
      });
    });
  }
  openFolder() {
    return new Promise((resolve, reject) => {
      this.setState({
        pickFolder: true,
        multiple: false,
        inputName: false,
        onCancel: () => resolve(null),
        onPick: files => resolve(this.createBlob(this.state.path, files[0])),
        onSave: null,
        onError: e => reject(e),
      });
    });
  }
  saveAs(defaultFileName) {
    return new Promise((resolve, reject) => {
      this.setState({
        pickFolder: false,
        multiple: false,
        inputName: true,
        defaultFileName: defaultFileName,
        onCancel: () => resolve(null),
        onPick: null,
        onSave: fileName => resolve(this.createBlob(this.state.path, {name: fileName})),
        onError: e => reject(e),
      });
    });
  }
  render() {
    return <CloudExplorer
      ref={c => this.onCloudExplorerReady(c)}
      path={this.state.path}
      onCancel={() => this.state.onCancel ? this.state.onCancel() : ''}
      onError={(e) => this.state.onError ? this.state.onError(e) : ''}
      onSave={fileName => this.state.onSave ? this.state.onSave(fileName) : ''}
      onPick={selection => this.state.onPick ? this.state.onPick(selection) : ''}
      onCd={path => this.onChange(path)}
      pickFolder={this.state.pickFolder}
      multiple={this.state.multiple}
      inputName={this.state.inputName}
      defaultFileName={this.state.defaultFileName}
    />;
  }
}

ReactDom.render(
  <App />,
  document.getElementById('cloud-explorer')
);
