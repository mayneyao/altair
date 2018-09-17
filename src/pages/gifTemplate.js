import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';

const styles = theme => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		overflow: 'hidden',
		backgroundColor: theme.palette.background.paper,
	},
	gridList: {
		width: '100%',
	},
	icon: {
		color: 'rgba(255, 255, 255, 0.54)',
	},
});

class TitlebarGridList extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			tileData: []
		}

	}

	componentDidMount() {
		axios.get('http://127.0.0.1:8000/gif/tmp/').then(res => {
			console.log(res.data)
			this.setState({
				tileData: res.data
			})
		})

	}

	render() {
		const {classes} = this.props;
		const {tileData} = this.state;
		return (
			<Grid container>
				<Grid item md={3}></Grid>
				<Grid item xs={12} md={6}>
					<div className={classes.root}>
						<GridList cellHeight='auto' className={classes.gridList} cols={1}>
							<GridListTile key="Subheader" cols={2} style={{height: 'auto'}}>
								<ListSubheader component="div">模板</ListSubheader>
							</GridListTile>
							{tileData.map(tile => (
								<GridListTile key={tile.id}>
									<img src={tile.img_url} alt={tile.title}/>
									<GridListTileBar
										title={tile.title}
										subtitle={<span>by: {tile.author}</span>}
										actionIcon={
											<IconButton className={classes.icon} href={`/#/?tmpId=${tile.id}`}>
												<InfoIcon/>
											</IconButton>
										}
									/>
								</GridListTile>
							))}
						</GridList>
					</div>
				</Grid>
				<Grid item md={3}></Grid>
			</Grid>

		);
	}
}

TitlebarGridList.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TitlebarGridList);