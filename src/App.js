import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {HashRouter as Router, Link, Route} from "react-router-dom";
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import BuildIcon from '@material-ui/icons/Build';
import HomeIcon from '@material-ui/icons/Home';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import FavoriteIcon from '@material-ui/icons/Favorite';
import grey from '@material-ui/core/colors/grey';

import gifMaker from './pages/gifMaker';
import gifTemplate from './pages/gifTemplate';
import myGif from './pages/myGif';
import myFavorite from './pages/myFavorite';


const styles = theme => ({
	media: {
		width: '100%',
	},
	wrap: {
		margin: '0 auto',
		width: 700
	},
	hide: {
		display: 'none',
	},
	show: {
		display: 'block',
	},
	root: {
		flexGrow: 1,
	},
	flex: {
		flex: 1,
	},
	menuButton: {},
	menuRoot: {
		width: 300
	},
	content: {
		paddingTop: '1em'
	},
	a: {
		textDecoration: 'none',
	},
	menuItem: {
		'&:focus': {
			backgroundColor: grey[200],
			'& $primary': {
				color: grey[900],
			},
		},
	},
	icon: {
		width: 64
	},
	logo: {
		padding: '1em',
		height: 90
	}
});


const menus = [
	{
		path: '/',
		menu: (props) => {
			const {classes} = props;
			return <Link to="/" className={classes.a}>
				<MenuItem className={classes.menuItem}>
					<ListItemIcon className={classes.icon}>
						<BuildIcon style={{color: '#2196f3'}}/>
					</ListItemIcon>
					<ListItemText classes={{primary: classes.primary}} inset primary="制作"/>
				</MenuItem>
			</Link>
		}
	},
	{
		path: '/tmp',
		menu: (props) => {
			const {classes} = props;
			return <Link to="/tmp" className={classes.a}>
				<MenuItem className={classes.menuItem}>
					<ListItemIcon className={classes.icon}>
						<HomeIcon style={{color: '#009688'}}/>
					</ListItemIcon>
					<ListItemText classes={{primary: classes.primary}} inset primary="模板仓库"/>
				</MenuItem>
			</Link>
		}
	},
	{
		path: '/my/gif',
		menu: (props) => {
			const {classes} = props;
			return <Link to="/my/gif" className={classes.a}>
				<MenuItem className={classes.menuItem}>
					<ListItemIcon className={classes.icon}>
						<PhotoLibraryIcon style={{color: '#ff5722'}}/>
					</ListItemIcon>
					<ListItemText classes={{primary: classes.primary}} inset primary="我的图库"/>
				</MenuItem>
			</Link>
		}
	},
	{
		path: '/my/fav',
		menu: (props) => {
			const {classes} = props;
			return <Link to="/my/fav" className={classes.a}>
				<MenuItem className={classes.menuItem}>
					<ListItemIcon className={classes.icon}>
						<FavoriteIcon style={{color: '#e91e63'}}/>
					</ListItemIcon>
					<ListItemText classes={{primary: classes.primary}} inset primary="我的收藏"/>
				</MenuItem>
			</Link>
		}
	},
];

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			drawerOpen: false,
		}
	}

	toggleDrawer = (open) => {
		this.setState({
			drawerOpen: open
		})
	};

	render() {
		const {classes} = this.props;
		const {drawerOpen} = this.state;
		return (
			<Router>
				<Grid container spacing={0}>
					<Grid item xs={12}>
						<div className={classes.root}>
							<IconButton className={classes.menuButton} color="inherit" aria-label="Menu"
							            onClick={() => this.toggleDrawer(true)}>
								<MenuIcon/>
							</IconButton>
						</div>
					</Grid>

					<Drawer open={drawerOpen} onClose={() => this.toggleDrawer(false)}>
						{/*<img src={logo} alt="" className={classes.logo}/>*/}
						<div
							tabIndex={0}
							role="button"
							onClick={() => this.toggleDrawer(false)}
							onKeyDown={() => this.toggleDrawer(false)}
						>
							<div className={classes.menuRoot}>
								<MenuList>
									{
										menus.map(item => item.menu(this.props))
									}
								</MenuList>
							</div>

						</div>
					</Drawer>

					<Grid item xs={12}>
						<main className={classes.content}>
							<Route key='1' path='/' exact component={gifMaker}/>
							<Route key='2' path='/tmp' exact component={gifTemplate}/>
							<Route key='3' path='/my/gif' exact component={myGif}/>
							<Route key='4' path='/my/fav' exact component={myFavorite}/>
						</main>
					</Grid>
				</Grid>
			</Router>
		);
	}
}

export default withStyles(styles)(App);