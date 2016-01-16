import './View';

class Component extends View {
    componentWillMount() {
        this.model = this.props.model;
    }
}
