import './entity-store.js';
// 'use strict';

/*eslint-disable no-unused-vars*/

window.D2L = window.D2L || {};
window.D2L.PolymerBehaviors = window.D2L.PolymerBehaviors || {};
window.D2L.PolymerBehaviors.Siren = window.D2L.PolymerBehaviors.Siren || {};

/*
* Behavior for fetching an entity when an href and token a present
* @polymerBehavior
*/
D2L.PolymerBehaviors.Siren.EntityBehavior = {
	properties: {
		/**
		 * The href for this siren entity
		 */
		href: {
			type: String,
			reflectToAttribute: true
		},

		/**
		 * The user access token
		 */
		token: {
			type: Object,
		},

		/**
		 * The fetched siren entity
		 */
		entity: {
			type: Object,
			value: null,
			notify: true,
			observer: '_onEntityChanged',
		},

		_entityChangedHandler: {
			type: Object,
			value: function() { return this._entityChanged.bind(this); }
		}
	},

	observers: [
		'_fetchEntity(href, token)'
	],

	attached: function() {
		this._fetchEntity(this.href, this.token);
	},

	detached: function() {
		if (this.removeListener) {
			this.removeListener();
			this.removeListener = null;
		}
	},

	_fetchEntity: function(href, token) {
		if (!href || (typeof token !== 'string' && typeof token !== 'function')) {
			return;
		}

		if (this.removeListener) {
			this.removeListener();
			this.removeListener = null;
		}

		window.D2L.Siren.EntityStore
			.addListener(href, token, this._entityChangedHandler)
			.then(function(removeListener) {
				if (this.href !== href) {
					removeListener();
					return;
				}

				if (this.token !== token) {
					removeListener();
					return;
				}

				this.removeListener = removeListener;
				window.D2L.Siren.EntityStore.fetch(href, token);
			}.bind(this));
	},

	_entityChanged: function(entity, error) {
		if (error) {
			this.fire('d2l-siren-entity-error', { error: error });
			return;
		}

		if (entity !== this.entity) {
			this.entity = entity;
			this.fire('d2l-siren-entity-changed', { entity: entity });
		}
	},

	_onEntityChanged: function(entity, oldEntity) {
		// default empty implementation
	},

	_getSelfLink: function(entity) {
		if (entity) {
			return entity.href || (entity.hasLinkByRel('self') ? entity.getLinkByRel('self').href : '');
		}
		return '';
	}
};
