import { Row, Col } from 'antd';
import ForumApi from '../../../modules/forum/lib/api'
import TopicList from '../../../modules/forum/components/topic'
import { withRouter } from 'next/router'
import pageLayout from '../../../components/pagelayout'
class Topic extends React.Component {
		constructor({query})
		{
                super();
                    }
	render() {
	return (
		<>
			Topic List!s
            <div id="uniq">
                <TopicList query={this.props.query}/>
            </div>
		</>
	)
	}
}
export default pageLayout(Topic);