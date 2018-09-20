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
import FavoriteIcon from '@material-ui/icons/Favorite';
import initdb from '../common/initdb';

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
	redIcon: {
		color: 'rgba(255, 0, 0, 0.54)',
	},
});

class TitlebarGridList extends React.Component {
	constructor(props) {
		super(props);
		let db = initdb();

		this.state = {
			db,
			tileData: [],
			favOriginRecord: [],
		}
	}

	updateFavItem = () => {
		const {db, tileData} = this.state;
		let favOriginRecord = db.queryAll("fav", {
			query: {source_type: 'origin'}
		});
		let data = [];
		tileData.map(item => {
			if (favOriginRecord.some(r => r.source_id === item.id)) {
				data.push({
					...item,
					is_fav: true,
				})
			} else {
				data.push({
					...item,
					is_fav: false,
				})
			}
		});
		this.setState({
			tileData: data
		})
	};

	componentDidMount() {
		axios.get('https://gine.me/gif/tmp/').then(res => {
			this.setState({
				tileData: res.data
			}, () => {
				this.updateFavItem();
			})
		})
	}

	rmFav = (record) => {
		const {db} = this.state;
		db.deleteRows("fav", {
			source_type: 'origin',
			source_id: record.id
		});
		db.commit();
		this.updateFavItem();
	};

	addFav = (record) => {
		const {db} = this.state;
		let now = new Date();
		db.insert("fav", {
			image_url: record.img_url,
			caption_template: record.caption_template,
			create_time: now.toISOString(),
			source_type: 'origin',
			source_id: record.id
		});
		db.commit();
		this.updateFavItem();
	};

	render() {
		const {classes} = this.props;
		const {tileData} = this.state;
		return (
			<Grid container>
				<Grid item md={3}></Grid>
				<Grid item xs={12} md={6}>
					<div className={classes.root}>
						<GridList cellHeight={200} className={classes.gridList} cols={2}>
							<GridListTile key="Subheader" cols={2} style={{height: 'auto'}}>
								<ListSubheader component="div">模板</ListSubheader>
							</GridListTile>
							{tileData.map(tile => (
								<GridListTile key={tile.id}>
									<img src={tile.img_url} alt={tile.title}/>
									<GridListTileBar
										title={tile.title}
										subtitle={<span/>}
										actionIcon={
											<div>
												{
													tile.is_fav ?
														<IconButton className={classes.redIcon}
														            onClick={() => this.rmFav(tile)}>
															<FavoriteIcon/>
														</IconButton>
														:
														<IconButton className={classes.icon}
														            onClick={() => this.addFav(tile)}>
															<FavoriteIcon/>
														</IconButton>
												}
												<IconButton className={classes.icon} href={`/#/?tmpId=${tile.id}`}>
													<InfoIcon/>
												</IconButton>
											</div>

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