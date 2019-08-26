import { tsx, create, isVNode } from '@dojo/framework/core/vdom';
import block from '@dojo/framework/core/middleware/block';
import Link from '@dojo/framework/routing/Link';

import LandingSubsection from '../landing/LandingSubsection';
import Page from '../page/Page';

import postBlock from './post.block';

import * as css from './BlogPost.m.css';
import { decorate } from '@dojo/framework/core/util';
import { VNode } from '@dojo/framework/core/interfaces';

export interface PostProperties {
	excerpt?: boolean;
	standalone?: boolean;
	path: string;
	url?: string;
}

export function formatDate(date: string) {
	let d = new Date(date);
	const options = {
		year: 'numeric',
		month: 'long',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	};

	return new Intl.DateTimeFormat('en-US', options).format(d);
}

const factory = create({ block }).properties<PostProperties>();

export default factory(function BlogPost({ middleware: { block }, properties }) {
	const { excerpt = false, standalone = false, path, url } = properties();
	const result = block(postBlock)({
		excerpt,
		path
	});

	if (result) {
		url &&
			decorate(
				result.content,
				(node: VNode) => {
					if (/^#/.test((node.properties as any).href)) {
						(node.properties as any).href = `${url}${node.properties.href}`;
					}
				},
				(node): node is VNode => isVNode(node) && node.tag === 'a'
			);
		const resultContent = [
			<p classes={css.meta}>{`${result.meta.author} ${formatDate(result.meta.date as string)}`}</p>,
			result.content
		];

		const readMoreLink = excerpt && (
			<p>
				<Link
					to="blog-post"
					params={{
						path: path.replace('blog/en/', '').replace('.md', '')
					}}
					classes={css.readMoreLink}
				>
					READ MORE
				</Link>
			</p>
		);

		if (standalone) {
			return (
				<Page classes={{ 'dojo.io/Page': { root: [css.root] } }}>
					<h1 classes={css.header}>{result.meta.title}</h1>
					{resultContent}
					{readMoreLink}
				</Page>
			);
		}

		return (
			<LandingSubsection classes={{ 'dojo.io/LandingSubsection': { root: [css.root] } }}>
				<Link
					to="blog-post"
					params={{
						path: path.replace('blog/en/', '').replace('.md', '')
					}}
					classes={css.headerLink}
				>
					<h1 classes={css.header}>{result.meta.title}</h1>
				</Link>
				{resultContent}
				{readMoreLink}
			</LandingSubsection>
		);
	}
});
