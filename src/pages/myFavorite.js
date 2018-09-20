import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import DeleteIcon from '@material-ui/icons/Delete';
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
});

class FavGridList extends React.Component {
	constructor(props) {
		super(props);
		let db = initdb();
		let records = db.queryAll("fav", {sort: [["ID", "DESC"]]});
		this.state = {
			tileData: records,
			db
		}
	}

	fetchData = () => {
		const {db} = this.state;
		let records = db.queryAll("fav", {sort: [["ID", "DESC"]]});
		this.setState({
			tileData: records,
		})
	};

	deleteRecord = (id) => {
		const {db} = this.state;
		db.deleteRows("fav", {ID: id});

		db.update("gifx", {fav_id: id}, function (row) {
			row.is_fav = false;
			row.fav_id = undefined;
			return row;
		});
		db.commit();
		this.fetchData();
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
								<ListSubheader component="div">
									我的收藏
								</ListSubheader>
							</GridListTile>
							{tileData.map(tile => (
								<GridListTile key={tile.id}>
									<img src={tile.image_url} alt={tile.title}/>
									<GridListTileBar
										title={tile.title}
										subtitle={<span/>}
										actionIcon={
											<div>
												<IconButton className={classes.icon}
												            onClick={() => this.deleteRecord(tile.ID)}>
													<DeleteIcon/>
												</IconButton>
												<IconButton className={classes.icon}
												            href={`/#/?tmpId=${tile.ID}&from=myFav`}>
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

FavGridList.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FavGridList);