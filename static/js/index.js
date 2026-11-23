window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

var PROJECT_TABS = ['proposal', 'milestone', 'final'];

function pausePanelMedia(panel) {
    panel.querySelectorAll('video').forEach(function(video) {
        video.pause();
    });
    panel.querySelectorAll('iframe[data-src]').forEach(function(frame) {
        if (frame.src && frame.src !== 'about:blank') {
            frame.src = 'about:blank';
        }
    });
}

function resumePanelMedia(panel) {
    panel.querySelectorAll('iframe[data-src]').forEach(function(frame) {
        if (frame.src !== frame.dataset.src) {
            frame.src = frame.dataset.src;
        }
    });
}

function layoutCarousels() {
    if (!window.__projectCarousels) {
        window.__projectCarousels = bulmaCarousel.attach('.carousel', {
            slidesToScroll: 1,
            slidesToShow: 1,
            loop: true,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 5000,
        });
        setupVideoCarouselAutoplay();
        return;
    }

    window.__projectCarousels.forEach(function(carousel) {
        if (carousel && typeof carousel._setDimensions === 'function') {
            carousel._setDimensions();
        }
    });
}

function showProjectTab(tabId, options) {
    options = options || {};
    if (PROJECT_TABS.indexOf(tabId) === -1) {
        tabId = 'proposal';
    }

    document.querySelectorAll('.project-tab').forEach(function(tab) {
        var selected = tab.dataset.tab === tabId;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
    });

    document.querySelectorAll('.tab-panel').forEach(function(panel) {
        var active = panel.dataset.tab === tabId;
        panel.hidden = !active;
        if (active) {
            resumePanelMedia(panel);
        } else {
            pausePanelMedia(panel);
        }
    });

    if (tabId === 'final') {
        layoutCarousels();
    }

    if (options.updateHash) {
        var nextHash = '#' + tabId;
        if (location.hash !== nextHash) {
            history.pushState({ tab: tabId }, '', nextHash);
        }
    }

    if (options.scroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function tabForHash(hash) {
    var id = (hash || '#proposal').replace('#', '');
    if (PROJECT_TABS.indexOf(id) !== -1) return id;

    var target = document.getElementById(id);
    if (target) {
        var panel = target.closest('.tab-panel');
        if (panel && PROJECT_TABS.indexOf(panel.dataset.tab) !== -1) {
            return panel.dataset.tab;
        }
    }
    return 'proposal';
}

function scrollToHashTarget() {
    var id = (location.hash || '').replace('#', '');
    if (!id || PROJECT_TABS.indexOf(id) !== -1) return;
    var target = document.getElementById(id);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function initProjectTabs() {
    var tablist = document.querySelector('.project-tabs');
    if (!tablist) return;

    tablist.addEventListener('click', function(event) {
        var tab = event.target.closest('.project-tab');
        if (!tab) return;
        showProjectTab(tab.dataset.tab, { updateHash: true, scroll: true });
    });

    tablist.addEventListener('keydown', function(event) {
        var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.project-tab'));
        var index = tabs.indexOf(document.activeElement);
        if (index === -1) return;

        var nextIndex = null;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex === null) return;

        event.preventDefault();
        tabs[nextIndex].focus();
        showProjectTab(tabs[nextIndex].dataset.tab, { updateHash: true, scroll: false });
    });

    window.addEventListener('popstate', function() {
        showProjectTab(tabForHash(location.hash), { updateHash: false, scroll: true });
    });

    window.addEventListener('hashchange', function() {
        showProjectTab(tabForHash(location.hash), { updateHash: false, scroll: false });
        scrollToHashTarget();
    });

    showProjectTab(tabForHash(location.hash), { updateHash: false, scroll: false });
    scrollToHashTarget();
}

function renderPageMath() {
    if (!window.renderMathInElement) return;

    var options = {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '\\(', right: '\\)', display: false}
        ],
        throwOnError: false
    };

    document.querySelectorAll('.tab-panel').forEach(function(panel) {
        var wasHidden = panel.hidden;
        panel.hidden = false;
        renderMathInElement(panel, options);
        panel.hidden = wasHidden;
    });

    if (document.fonts && document.fonts.load) {
        document.fonts.load('1em KaTeX_Main');
        document.fonts.load('1em KaTeX_Math');
        document.fonts.load('1em KaTeX_Caligraphic');
    }
}

$(document).ready(function() {
    bulmaSlider.attach();
    initProjectTabs();
    renderPageMath();
})
