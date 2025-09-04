const sections = ['campaigns', 'characters', 'bestiary', 'world-building'];

const routes = {
    '': { pageId: 'campaigns', navIndex: 0 },
    'campaigns': { pageId: 'campaigns', navIndex: 0 },
    'characters': { pageId: 'characters', navIndex: 1 },
    'bestiary': { pageId: 'bestiary', navIndex: 2 },
    'world-building': { pageId: 'world-building', navIndex: 3 },
};

class HashRouter {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.bookmarks = document.querySelectorAll('.bookmark');
        this.pages = document.querySelectorAll('.page');
        
        this.init();
    }

    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPath = link.getAttribute('href').substring(1);
                this.navigateTo(targetPath);
            });
        });

        document.addEventListener('click', (e) => {
            const contentCard = e.target.closest('[data-content]');
            if (contentCard) {
                e.preventDefault();
                const filename = contentCard.getAttribute('data-content');
                this.showContent(filename);
            }
        });

        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });

        this.handleRoute();
    }

    navigateTo(path) {
        window.location.hash = path;
    }

    handleRoute() {
        const hash = window.location.hash.substring(1) || '';
        
        if (hash.startsWith('content/')) {
            const filename = hash.substring(8);
            sections.forEach(section => {
                if (filename.startsWith(section)) {
                    this.updateNavigation(routes[section].navIndex);
                }
            });
            this.showContentFile(filename);
            return;
        }
        
        const route = routes[hash] || routes['campaigns'];
        this.updateNavigation(route.navIndex);
        this.updatePage(route.pageId);
        this.updateTitle(route.pageId);
    }

    async showContentFile(filename) {
        this.pages.forEach(page => page.classList.remove('active'));
        const assetPage = document.getElementById('md-asset');
        if (!assetPage) return;
        
        assetPage.classList.add('active');
        
        try {
            const response = await fetch(`./generated/${filename}`);
            if (!response.ok) {
                throw new Error(`Could not load ${filename}`);
            }
            
            const htmlFragment = await response.text();
            
            assetPage.innerHTML = `
                <div class="markdown-content">
                    <button class="back-button" onclick="history.back()">← Back</button>
                    <article>
                        ${htmlFragment}
                    </article>
                </div>
            `;
            
            const title = filename.replace('.html', '').replace(/-/g, ' ');
            document.title = `Resources - ${title}`;
            
        } catch (error) {
            assetPage.innerHTML = `
                <div class="error-content">
                    <button class="back-button" onclick="history.back()">← Back</button>
                    <h2>Error Loading Content</h2>
                    <p>Could not load "${filename}"</p>
                </div>
            `;
        }
    }

    showContent(filename) {
        window.location.hash = `content/${filename}`;
    }

    updateNavigation(activeIndex) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.classList.add('inactive');
        });
        
        this.bookmarks.forEach(bookmark => {
            bookmark.classList.remove('active');
        });

        if (activeIndex >= 0 && activeIndex < this.navLinks.length) {
            this.navLinks[activeIndex].classList.add('active');
            this.navLinks[activeIndex].classList.remove('inactive');
            this.bookmarks[activeIndex].classList.add('active');
        }
    }

    updatePage(pageId) {
        this.pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    updateTitle(pageId) {
        const titles = {
            'campaigns': 'TTRPG Resources - Campaigns',
            'characters': 'TTRPG Resources - Characters', 
            'bestiary': 'TTRPG Resources - Bestiary',
            'world-building': 'TTRPG Resources - World Building'
        };
        
        document.title = titles[pageId] || 'TTRPG Resources';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.hashRouter = new HashRouter();
});