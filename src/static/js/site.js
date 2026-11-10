(function (window, document) {
  'use strict';

  var DATA = window.PANGU || { site: {}, groups: [], packages: [], projects: [] };
  var GROUP_MAP = {};
  var PKG_MAP = {};
  var PROJECT_MAP = {};

  DATA.groups.forEach(function (g) {
    GROUP_MAP[g.key] = g;
  });
  DATA.packages.forEach(function (p) {
    PKG_MAP[p.name] = p;
  });
  DATA.projects.forEach(function (p) {
    PROJECT_MAP[p.slug] = p;
  });

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function groupOf(key) {
    return GROUP_MAP[key] || { key: key, name: key, color: '#16baaa', icon: 'layui-icon-component' };
  }

  function setPageMeta(relative) {
    var base = DATA.site && DATA.site.url ? DATA.site.url.replace(/\/+$/, '') : '';
    if (!base) return;

    var url = base + '/' + relative;
    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', url);
  }

  function packageHref(pkg) {
    return 'package.html?name=' + encodeURIComponent(pkg.name);
  }

  function projectHref(project) {
    return 'project.html?slug=' + encodeURIComponent(project.slug);
  }

  function repoUrl(name) {
    return DATA.site.github + '/' + name;
  }

  function pkgTags(tags) {
    return (tags || [])
      .map(function (tag) {
        return '<span class="pg-tag">' + esc(tag) + '</span>';
      })
      .join('');
  }

  function initNav() {
    var page = document.body.getAttribute('data-page');
    $$('.pg-nav a').forEach(function (link) {
      if (link.getAttribute('data-page') === page) {
        link.classList.add('is-active');
      }
    });

    var toggle = $('.pg-nav-toggle');
    var nav = $('.pg-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var year = $('#pg-year');
    if (year) {
      year.textContent = new Date().getFullYear();
    }
  }

  function initHome() {
    var stats = $('#hero-stats');
    if (stats) {
      var storeCount = DATA.packages.filter(function (p) {
        return p.group === 'store';
      }).length;
      var independentCount = DATA.projects.filter(function (p) {
        return p.category === '独立服务' || p.category === '探索项目';
      }).length;
      stats.innerHTML = [
        { value: DATA.packages.length, unit: '个', label: 'Composer 组件' },
        { value: DATA.groups.length, unit: '类', label: '能力分类' },
        { value: independentCount, unit: '个', label: '独立项目' },
        { value: storeCount, unit: '个', label: '商店套件' },
      ]
        .map(function (item, index) {
          return (
            '<div class="pg-stat pg-fade pg-delay-' +
            (index + 1) +
            '">' +
            '<div class="pg-stat-value">' +
            item.value +
            '<span>' +
            item.unit +
            '</span></div>' +
            '<div class="pg-stat-label">' +
            item.label +
            '</div>' +
            '</div>'
          );
        })
        .join('');
    }

    var search = $('#hero-search');
    if (search) {
      search.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          var q = search.value.trim();
          window.location.href = 'packages.html' + (q ? '?q=' + encodeURIComponent(q) : '');
        }
      });
    }

    renderEntries();
    renderFeatured();
    renderGroups();
    renderProjectPreview();
  }

  function renderEntries() {
    var box = $('#entry-grid');
    if (!box) return;

    var composerCount = DATA.packages.filter(function (p) {
      return p.group !== 'store';
    }).length;
    var storeCount = DATA.packages.filter(function (p) {
      return p.group === 'store';
    }).length;
    var entries = [
      {
        icon: 'layui-icon-component',
        title: 'Composer 组件',
        count: composerCount,
        unit: '个包',
        desc: '围绕 ThinkPHP 8 打磨的即插即用能力模块，从认证、存储到图片与第三方集成。',
        href: 'packages.html',
        link: '查看组件矩阵',
      },
      {
        icon: 'layui-icon-cart',
        title: '应用商店',
        count: storeCount,
        unit: '个发布包',
        desc: 'think-static 负责自动部署，think-store 负责查询与同步，构成完整的发布包闭环。',
        href: 'projects.html',
        link: '了解商店体系',
      },
      {
        icon: 'layui-icon-desktop',
        title: '后台框架',
        count: 1,
        unit: '套模板',
        desc: 'LayuiAdmin-Iframe：经典 iframe 布局，原生 Layui 模块体系与完整前端工程化脚本。',
        href: 'project.html?slug=layuiadmin-iframe',
        link: '查看后台框架',
      },
      {
        icon: 'layui-icon-picture',
        title: '独立项目',
        count: 3,
        unit: '个项目',
        desc: 'glide-server 按需缩略图服务与其它脱离框架也能独立运行的工程实践。',
        href: 'projects.html',
        link: '浏览独立项目',
      },
    ];

    box.innerHTML = entries
      .map(function (item) {
        return (
          '<a class="pg-entry pg-fade" href="' +
          item.href +
          '">' +
          '<div class="pg-entry-top">' +
          '<div class="pg-entry-icon"><i class="layui-icon ' +
          item.icon +
          '"></i></div>' +
          '<div class="pg-entry-count">' +
          item.count +
          '<span>' +
          item.unit +
          '</span></div>' +
          '</div>' +
          '<h3>' +
          item.title +
          '</h3>' +
          '<p>' +
          esc(item.desc) +
          '</p>' +
          '<span class="pg-entry-link">' +
          item.link +
          ' <i class="layui-icon layui-icon-right"></i></span>' +
          '</a>'
        );
      })
      .join('');
  }

  function renderFeatured() {
    var box = $('#featured-grid');
    if (!box) return;

    var names = [
      'think-addons',
      'think-jwt',
      'think-glide',
      'think-regions',
      'think-workerman',
      'think-store-codeditor',
    ];
    var items = names
      .map(function (name) {
        return PKG_MAP[name];
      })
      .filter(Boolean);

    box.innerHTML = items
      .map(function (pkg, index) {
        var group = groupOf(pkg.group);
        return (
          '<a class="pg-pkg pg-fade pg-delay-' +
          ((index % 3) + 1) +
          '" href="' +
          packageHref(pkg) +
          '">' +
          '<div class="pg-pkg-top">' +
          '<div class="pg-pkg-name">' +
          esc(pkg.name) +
          '</div>' +
          '<div class="pg-pkg-title">' +
          esc(pkg.title) +
          '</div>' +
          '</div>' +
          '<p class="pg-pkg-desc">' +
          esc(pkg.summary) +
          '</p>' +
          '<div class="pg-pkg-tags">' +
          pkgTags(pkg.tags) +
          '</div>' +
          '<div class="pg-pkg-foot"><span>' +
          esc(group.name) +
          '</span><span>查看用法 <i class="layui-icon layui-icon-right"></i></span></div>' +
          '</a>'
        );
      })
      .join('');
  }

  function renderGroups() {
    var box = $('#group-grid');
    if (!box) return;

    box.innerHTML = DATA.groups
      .map(function (group, index) {
        var items = DATA.packages.filter(function (p) {
          return p.group === group.key;
        });
        var preview = items.slice(0, 6);
        var rest = items.length - preview.length;
        return (
          '<div class="pg-group-card pg-fade pg-delay-' +
          ((index % 4) + 1) +
          '" style="--accent:' +
          group.color +
          '">' +
          '<div class="pg-group-head">' +
          '<div class="pg-group-icon"><i class="layui-icon ' +
          group.icon +
          '"></i></div>' +
          '<div class="pg-group-name">' +
          esc(group.name) +
          '</div>' +
          '<div class="pg-group-count">' +
          items.length +
          '</div>' +
          '</div>' +
          '<p class="pg-group-desc">' +
          esc(group.desc) +
          '</p>' +
          '<div class="pg-group-pkgs">' +
          preview
            .map(function (pkg) {
              return (
                '<a class="pg-mini-pkg" href="' +
                packageHref(pkg) +
                '" title="' +
                esc(pkg.title) +
                '">' +
                esc(pkg.name.replace('think-', '')) +
                '</a>'
              );
            })
            .join('') +
          (rest > 0 ? '<span class="pg-mini-pkg" style="color:#7a9291">+' + rest + '</span>' : '') +
          '</div>' +
          '<a class="pg-group-more" href="packages.html?group=' +
          group.key +
          '">查看全部 <i class="layui-icon layui-icon-right"></i></a>' +
          '</div>'
        );
      })
      .join('');
  }

  function renderProjectPreview() {
    var box = $('#project-preview');
    if (!box) return;

    var items = DATA.projects.slice(0, 4);
    box.innerHTML = items
      .map(function (project, index) {
        return (
          '<a class="pg-project pg-fade pg-delay-' +
          ((index % 4) + 1) +
          '" href="' +
          projectHref(project) +
          '">' +
          '<div class="pg-project-icon"><i class="layui-icon ' +
          project.icon +
          '"></i></div>' +
          '<div>' +
          '<h3>' +
          esc(project.name) +
          '<span class="pg-badge">' +
          esc(project.badge) +
          '</span></h3>' +
          '<p>' +
          esc(project.summary) +
          '</p>' +
          '<div class="pg-project-meta">' +
          project.stack
            .slice(0, 4)
            .map(function (tech) {
              return '<span class="pg-tag">' + esc(tech) + '</span>';
            })
            .join('') +
          '</div>' +
          '</div>' +
          '<div class="pg-project-arrow"><i class="layui-icon layui-icon-right"></i></div>' +
          '</a>'
        );
      })
      .join('');
  }

  function currentQuery() {
    var params = new URLSearchParams(window.location.search);
    var group = params.get('group') || 'all';
    var q = params.get('q') || '';
    var sort = params.get('sort') || 'default';
    var page = parseInt(params.get('page') || '1', 10);
    return {
      group: GROUP_MAP[group] ? group : 'all',
      q: q,
      sort: ['default', 'name', 'group'].indexOf(sort) !== -1 ? sort : 'default',
      page: isNaN(page) || page < 1 ? 1 : page,
    };
  }

  function initPackagesPage() {
    var grid = $('#pkg-grid');
    if (!grid) return;

    var searchInput = $('#pkg-search-input');

    var chipsBox = $('#pkg-chips');
    var metaBox = $('#pkg-result-meta');
    var pagerBox = $('#pkg-pager');
    var emptyBox = $('#pkg-empty');
    var limit = 12;
    var state = currentQuery();
    var filtered = [];
    var page = state.page;
    var timer = null;

    function buildChips() {
      var all = DATA.packages.length;
      var chips = [{ key: 'all', name: '全部', count: all }].concat(
        DATA.groups.map(function (group) {
          return {
            key: group.key,
            name: group.name,
            count: DATA.packages.filter(function (p) {
              return p.group === group.key;
            }).length,
          };
        })
      );

      chipsBox.innerHTML = chips
        .map(function (chip) {
          return (
            '<button type="button" class="pg-chip' +
            (chip.key === state.group ? ' is-active' : '') +
            '" data-group="' +
            chip.key +
            '">' +
            esc(chip.name) +
            '<span class="pg-chip-count">' +
            chip.count +
            '</span></button>'
          );
        })
        .join('');

      $$('.pg-chip', chipsBox).forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.group = btn.getAttribute('data-group');
          page = 1;
          buildChips();
          apply();
        });
      });
    }

    function filterList() {
      var q = state.q.trim().toLowerCase();
      filtered = DATA.packages.filter(function (pkg) {
        if (state.group !== 'all' && pkg.group !== state.group) return false;
        if (!q) return true;
        var haystack = [pkg.name, pkg.package, pkg.title, pkg.summary, pkg.description]
          .concat(pkg.tags || [])
          .join(' ')
          .toLowerCase();
        return haystack.indexOf(q) !== -1;
      });

      var sort = state.sort;
      if (sort === 'name') {
        filtered.sort(function (a, b) {
          return a.name.localeCompare(b.name, 'en');
        });
      } else if (sort === 'group') {
        filtered.sort(function (a, b) {
          var ga = DATA.groups.findIndex(function (g) {
            return g.key === a.group;
          });
          var gb = DATA.groups.findIndex(function (g) {
            return g.key === b.group;
          });
          return ga - gb || a.name.localeCompare(b.name, 'en');
        });
      }
    }

    function renderCards() {
      var start = (page - 1) * limit;
      var items = filtered.slice(start, start + limit);

      grid.innerHTML = items
        .map(function (pkg, index) {
          var group = groupOf(pkg.group);
          return (
            '<a class="pg-pkg pg-fade pg-delay-' +
            ((index % 3) + 1) +
            '" href="' +
            packageHref(pkg) +
            '">' +
            '<div class="pg-pkg-top">' +
            '<div class="pg-pkg-name">' +
            esc(pkg.name) +
            '</div>' +
            '<div class="pg-pkg-title">' +
            esc(pkg.title) +
            '</div>' +
            '</div>' +
            '<p class="pg-pkg-desc">' +
            esc(pkg.summary) +
            '</p>' +
            '<div class="pg-pkg-tags">' +
            pkgTags(pkg.tags) +
            '</div>' +
            '<div class="pg-pkg-foot"><span style="color:' +
            group.color +
            '">' +
            esc(group.name) +
            '</span><span>' +
            esc(pkg.package) +
            '</span></div>' +
            '</a>'
          );
        })
        .join('');

      emptyBox.style.display = filtered.length ? 'none' : 'block';
      grid.style.display = filtered.length ? 'grid' : 'none';

      var groupLabel = state.group === 'all' ? '全部组件' : groupOf(state.group).name;
      metaBox.innerHTML =
        '<div>共找到 <strong>' +
        filtered.length +
        '</strong> 个组件 · ' +
        esc(groupLabel) +
        (state.q ? ' · 关键词 “' + esc(state.q) + '”' : '') +
        '</div>' +
        '<div><select id="pkg-sort" aria-label="排序方式">' +
        '<option value="default"' +
        (state.sort === 'default' ? ' selected' : '') +
        '>推荐排序</option>' +
        '<option value="name"' +
        (state.sort === 'name' ? ' selected' : '') +
        '>名称 A-Z</option>' +
        '<option value="group"' +
        (state.sort === 'group' ? ' selected' : '') +
        '>按分类</option>' +
        '</select></div>';

      var sortEl = $('#pkg-sort');
      sortEl.addEventListener('change', function () {
        state.sort = sortEl.value;
        page = 1;
        apply();
      });
    }

    function renderPager() {
      pagerBox.innerHTML = '';
      if (filtered.length <= limit) return;

      var totalPages = Math.ceil(filtered.length / limit);
      if (page > totalPages) {
        page = totalPages;
        renderCards();
      }

      if (window.layui && layui.laypage) {
        layui.laypage.render({
          elem: 'pkg-pager',
          count: filtered.length,
          limit: limit,
          curr: page,
          layout: ['prev', 'page', 'next', 'skip', 'count'],
          jump: function (obj, first) {
            if (first) return;
            page = obj.curr;
            apply(false);
            var top = $('#pkg-grid').getBoundingClientRect().top + window.scrollY - 110;
            window.scrollTo({ top: top, behavior: 'smooth' });
          },
        });
      } else {
        pagerBox.innerHTML =
          '<button class="pg-btn pg-btn-outline pg-btn-sm" type="button">第 ' +
          page +
          ' / ' +
          totalPages +
          ' 页</button>';
      }
    }

    function syncUrl() {
      var params = new URLSearchParams();
      if (state.group !== 'all') params.set('group', state.group);
      if (state.q) params.set('q', state.q);
      if (state.sort !== 'default') params.set('sort', state.sort);
      if (page > 1) params.set('page', String(page));
      var query = params.toString();
      try {
        history.replaceState(null, '', window.location.pathname + (query ? '?' + query : ''));
      } catch (error) {
        // file:// 或受限环境下不同步地址栏，不影响页面渲染
      }
    }

    function apply(resetPage) {
      if (resetPage !== false) {
        if (page < 1) page = 1;
      }
      filterList();
      var totalPages = Math.max(1, Math.ceil(filtered.length / limit));
      if (page > totalPages) page = totalPages;
      renderCards();
      renderPager();
      syncUrl();
    }

    if (searchInput) {
      searchInput.value = state.q;
      searchInput.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.q = searchInput.value;
          page = 1;
          apply();
        }, 220);
      });
    }

    buildChips();
    apply();
  }

  function initPackageDetail() {
    var root = $('#package-detail');
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var name = params.get('name') || '';
    var pkg = PKG_MAP[name];

    if (!pkg) {
      showMissing(
        root,
        '没有找到这个组件',
        '组件可能已经更名，或链接中的 name 参数不正确。',
        'packages.html',
        '返回组件矩阵'
      );
      return;
    }

    var group = groupOf(pkg.group);
    var related = DATA.packages
      .filter(function (p) {
        return p.group === pkg.group && p.name !== pkg.name;
      })
      .slice(0, 4);

    document.title = pkg.name + ' · ' + pkg.title + ' · PanGu';
    setPageMeta('package.html?name=' + encodeURIComponent(pkg.name));

    var head = $('#detail-head');
    head.innerHTML =
      '<div class="pg-breadcrumb"><a href="index.html">首页</a><i class="layui-icon layui-icon-right"></i>' +
      '<a href="packages.html">组件矩阵</a><i class="layui-icon layui-icon-right"></i>' +
      '<a href="packages.html?group=' +
      group.key +
      '">' +
      esc(group.name) +
      '</a><i class="layui-icon layui-icon-right"></i>' +
      '<span>' +
      esc(pkg.name) +
      '</span></div>' +
      '<div class="pg-detail-top">' +
      '<div class="pg-detail-icon"><i class="layui-icon ' +
      group.icon +
      '"></i></div>' +
      '<div>' +
      '<h1 class="pg-detail-title">' +
      esc(pkg.name) +
      '</h1>' +
      '<p class="pg-detail-tagline">' +
      esc(pkg.summary) +
      '</p>' +
      '<div class="pg-detail-badges">' +
      '<span class="pg-badge">' +
      esc(group.name) +
      '</span>' +
      '<span class="pg-badge is-ghost">' +
      esc(pkg.title) +
      '</span>' +
      '<span class="pg-badge is-ghost">PHP >= 8.0</span>' +
      '<span class="pg-badge is-ghost">ThinkPHP 8</span>' +
      '</div></div></div>';

    $('#detail-body').innerHTML =
      '<div class="pg-panel">' +
      '<h2 class="pg-panel-title"><i class="layui-icon layui-icon-about"></i>组件说明</h2>' +
      '<div class="pg-prose"><p>' +
      esc(pkg.description) +
      '</p></div>' +
      '</div>' +
      '<div class="pg-panel">' +
      '<h2 class="pg-panel-title"><i class="layui-icon layui-icon-ok-circle"></i>核心能力</h2>' +
      '<div class="pg-feature-list">' +
      pkg.highlights
        .map(function (text) {
          return '<div class="pg-feature"><h4>' + esc(text) + '</h4></div>';
        })
        .join('') +
      '</div>' +
      '</div>' +
      '<div class="pg-panel">' +
      '<h2 class="pg-panel-title"><i class="layui-icon layui-icon-download-circle"></i>安装</h2>' +
      '<div class="pg-code-label">composer</div>' +
      '<pre class="pg-code"><button type="button" class="pg-code-copy" data-copy="composer require ' +
      esc(pkg.package) +
      '" title="复制命令"><i class="layui-icon layui-icon-file"></i></button>composer require ' +
      esc(pkg.package) +
      '</pre>' +
      '<div class="pg-code-label">服务发现（如项目未自动加载）</div>' +
      '<pre class="pg-code"><button type="button" class="pg-code-copy" data-copy="php think service:discover" title="复制命令"><i class="layui-icon layui-icon-file"></i></button>php think service:discover\nphp think vendor:publish</pre>' +
      '</div>' +
      '<div class="pg-panel">' +
      '<h2 class="pg-panel-title"><i class="layui-icon layui-icon-link"></i>适用场景与标签</h2>' +
      '<div class="pg-pkg-tags" style="margin-bottom:14px">' +
      pkgTags(pkg.tags) +
      '</div>' +
      '<div class="pg-prose"><p>该组件归属于「' +
      esc(group.name) +
      '」分类。' +
      esc(group.desc) +
      ' 适合在 ThinkPHP 8 项目中通过 Composer 引入，通过服务注册、配置文件与门面直接使用。</p></div>' +
      '</div>';

    $('#detail-side').innerHTML =
      '<div class="pg-side-card">' +
      '<h4>组件信息</h4>' +
      '<ul class="pg-meta-list">' +
      '<li><span class="k">Composer</span><span class="v mono">' +
      esc(pkg.package) +
      '</span></li>' +
      '<li><span class="k">分类</span><span class="v">' +
      esc(group.name) +
      '</span></li>' +
      '<li><span class="k">中文名</span><span class="v">' +
      esc(pkg.title) +
      '</span></li>' +
      '<li><span class="k">PHP</span><span class="v mono">>= 8.0</span></li>' +
      '<li><span class="k">框架</span><span class="v">ThinkPHP 8</span></li>' +
      '</ul></div>' +
      '<div class="pg-side-card">' +
      '<h4>仓库</h4>' +
      '<a class="pg-btn pg-btn-outline pg-btn-sm" style="width:100%" href="' +
      repoUrl(pkg.name) +
      '" target="_blank" rel="noopener">' +
      '<i class="layui-icon layui-icon-log">GitHub</i></a>' +
      '<p style="margin:12px 0 0;font-size:12px;color:#7a9291;line-height:1.7">README、更新记录与 Issue 均在 GitHub 仓库维护。</p>' +
      '</div>' +
      (related.length
        ? '<div class="pg-side-card">' +
          '<h4>同分类推荐</h4>' +
          '<div class="pg-related">' +
          related
            .map(function (item) {
              return (
                '<a href="' +
                packageHref(item) +
                '"><i class="layui-icon layui-icon-component"></i><span class="pg-related-name">' +
                esc(item.name) +
                '</span></a>'
              );
            })
            .join('') +
          '</div></div>'
        : '');

    if (window.layui && layui.use) {
      layui.use('layer', function () {
        bindCopy(layui.layer);
      });
    } else {
      bindCopy(null);
    }
  }

  function showMissing(root, title, desc, href, label) {
    root.innerHTML =
      '<div class="pg-empty" style="margin:40px 0">' +
      '<i class="layui-icon layui-icon-face-surprised"></i>' +
      '<h3>' +
      esc(title) +
      '</h3>' +
      '<p>' +
      esc(desc) +
      '</p>' +
      '<a class="pg-btn pg-btn-primary" href="' +
      href +
      '">' +
      esc(label) +
      '</a>' +
      '</div>';
  }

  function initProjectsPage() {
    var box = $('#projects-list');
    if (!box) return;

    var core = DATA.projects.filter(function (p) {
      return p.category === '应用商店' || p.category === '部署工具';
    });
    var independent = DATA.projects.filter(function (p) {
      return p.category !== '应用商店' && p.category !== '部署工具';
    });

    function cards(items, startIndex) {
      return items
        .map(function (project, index) {
          return (
            '<a class="pg-project pg-fade pg-delay-' +
            ((index % 4) + 1) +
            '" href="' +
            projectHref(project) +
            '">' +
            '<div class="pg-project-icon"><i class="layui-icon ' +
            project.icon +
            '"></i></div>' +
            '<div>' +
            '<h3>' +
            esc(project.name) +
            '<span class="pg-badge">' +
            esc(project.badge) +
            '</span></h3>' +
            '<p>' +
            esc(project.summary) +
            '</p>' +
            '<div class="pg-project-meta">' +
            '<span class="pg-tag">' +
            esc(project.category) +
            '</span>' +
            project.stack
              .slice(0, 3)
              .map(function (tech) {
                return '<span class="pg-tag">' + esc(tech) + '</span>';
              })
              .join('') +
            '</div></div>' +
            '<div class="pg-project-arrow"><i class="layui-icon layui-icon-right"></i></div>' +
            '</a>'
          );
        })
        .join('');
    }

    box.innerHTML =
      '<div class="pg-section is-tight" id="store-suite">' +
      '<div class="pg-section-head"><div><div class="pg-eyebrow">Store Suite</div>' +
      '<h2 class="pg-section-title">应用商店套件</h2>' +
      '<p class="pg-section-desc">从静态资源部署到发布包管理、再到示例与在线编辑器，四个仓库组成一条完整链路。</p></div></div>' +
      '<div class="pg-project-list">' +
      cards(core, 0) +
      '</div></div>' +
      '<div class="pg-section is-tight" id="independent">' +
      '<div class="pg-section-head"><div><div class="pg-eyebrow">Independent</div>' +
      '<h2 class="pg-section-title">独立项目</h2>' +
      '<p class="pg-section-desc">不依附 Composer 包形态的框架、服务与探索项目，可单独部署运行。</p></div></div>' +
      '<div class="pg-project-list">' +
      cards(independent, 4) +
      '</div></div>';
  }

  function initProjectDetail() {
    var root = $('#project-detail');
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug') || '';
    var project = PROJECT_MAP[slug];

    if (!project) {
      showMissing(
        root,
        '没有找到这个项目',
        '项目可能已经归档，或链接中的 slug 参数不正确。',
        'projects.html',
        '返回项目列表'
      );
      return;
    }

    document.title = project.name + ' · PanGu';
    setPageMeta('project.html?slug=' + encodeURIComponent(project.slug));

    var related = (project.related || [])
      .map(function (key) {
        return PKG_MAP[key] || PROJECT_MAP[key];
      })
      .filter(Boolean);

    $('#project-head').innerHTML =
      '<div class="pg-breadcrumb"><a href="index.html">首页</a><i class="layui-icon layui-icon-right"></i>' +
      '<a href="projects.html">项目</a><i class="layui-icon layui-icon-right"></i>' +
      '<span>' +
      esc(project.name) +
      '</span></div>' +
      '<div class="pg-detail-top">' +
      '<div class="pg-detail-icon"><i class="layui-icon ' +
      project.icon +
      '"></i></div>' +
      '<div><h1 class="pg-detail-title">' +
      esc(project.name) +
      '</h1>' +
      '<p class="pg-detail-tagline">' +
      esc(project.tagline) +
      '</p>' +
      '<div class="pg-detail-badges">' +
      '<span class="pg-badge">' +
      esc(project.badge) +
      '</span>' +
      '<span class="pg-badge is-ghost">' +
      esc(project.category) +
      '</span>' +
      project.stack
        .slice(0, 3)
        .map(function (tech) {
          return '<span class="pg-badge is-ghost">' + esc(tech) + '</span>';
        })
        .join('') +
      '</div></div></div>';

    var bodyHtml =
      '<div class="pg-panel"><h2 class="pg-panel-title"><i class="layui-icon layui-icon-about"></i>项目定位</h2>' +
      '<div class="pg-prose">' +
      project.intro
        .map(function (text) {
          return '<p>' + esc(text) + '</p>';
        })
        .join('') +
      '</div></div>' +
      '<div class="pg-panel"><h2 class="pg-panel-title"><i class="layui-icon layui-icon-ok-circle"></i>核心特性</h2>' +
      '<div class="pg-feature-list">' +
      project.features
        .map(function (feature) {
          return (
            '<div class="pg-feature"><h4>' +
            esc(feature.title) +
            '</h4><p>' +
            esc(feature.text) +
            '</p></div>'
          );
        })
        .join('') +
      '</div></div>';

    if (project.install) {
      bodyHtml +=
        '<div class="pg-panel"><h2 class="pg-panel-title"><i class="layui-icon layui-icon-download-circle"></i>安装与启动</h2>' +
        '<pre class="pg-code"><button type="button" class="pg-code-copy" data-copy="' +
        esc(project.install) +
        '" title="复制命令"><i class="layui-icon layui-icon-file"></i></button>' +
        esc(project.install) +
        '</pre>' +
        (project.entry
          ? '<p style="margin:12px 0 0;font-size:12.5px;color:#7a9291">部署完成后访问：<code style="font-family:var(--pg-mono);color:#0e8f83">' +
            esc(project.entry) +
            '</code></p>'
          : '') +
        '</div>';
    }

    if (project.endpoints && project.endpoints.length) {
      bodyHtml +=
        '<div class="pg-panel"><h2 class="pg-panel-title"><i class="layui-icon layui-icon-link"></i>接口</h2>' +
        '<table class="pg-endpoints"><thead><tr><th style="width:78px">方法</th><th style="width:220px">地址</th><th>说明</th></tr></thead><tbody>' +
        project.endpoints
          .map(function (endpoint) {
            return (
              '<tr><td><span class="pg-method' +
              (endpoint.method === 'POST' ? ' is-post' : '') +
              '">' +
              esc(endpoint.method) +
              '</span></td>' +
              '<td><code>' +
              esc(endpoint.path) +
              '</code></td><td>' +
              esc(endpoint.desc) +
              '</td></tr>'
            );
          })
          .join('') +
        '</tbody></table></div>';
    }

    bodyHtml +=
      '<div class="pg-panel"><h2 class="pg-panel-title"><i class="layui-icon layui-icon-set"></i>技术栈</h2>' +
      '<div class="pg-pkg-tags">' +
      project.stack
        .map(function (tech) {
          return '<span class="pg-tag">' + esc(tech) + '</span>';
        })
        .join('') +
      '</div></div>';

    $('#project-body').innerHTML = bodyHtml;

    var sideHtml =
      '<div class="pg-side-card"><h4>项目信息</h4><ul class="pg-meta-list">' +
      '<li><span class="k">名称</span><span class="v">' +
      esc(project.name) +
      '</span></li>' +
      '<li><span class="k">类型</span><span class="v">' +
      esc(project.category) +
      '</span></li>' +
      (project.package
        ? '<li><span class="k">Composer</span><span class="v mono">' + esc(project.package) + '</span></li>'
        : '') +
      (project.entry
        ? '<li><span class="k">入口</span><span class="v mono">' + esc(project.entry) + '</span></li>'
        : '') +
      '</ul></div>' +
      '<div class="pg-side-card"><h4>仓库</h4>' +
      '<a class="pg-btn pg-btn-outline pg-btn-sm" style="width:100%" href="' +
      repoUrl(project.name) +
      '" target="_blank" rel="noopener"><i class="layui-icon layui-icon-log">GitHub</i></a>' +
      '</div>';

    if (related.length) {
      sideHtml +=
        '<div class="pg-side-card"><h4>相关项目</h4><div class="pg-related">' +
        related
          .map(function (item) {
            var href = item.slug ? projectHref(item) : packageHref(item);
            var label = item.slug ? item.name : item.name;
            return (
              '<a href="' +
              href +
              '"><i class="layui-icon ' +
              (item.icon || 'layui-icon-component') +
              '"></i><span class="pg-related-name">' +
              esc(label) +
              '</span></a>'
            );
          })
          .join('') +
        '</div></div>';
    }

    $('#project-side').innerHTML = sideHtml;

    if (window.layui && layui.use) {
      layui.use('layer', function () {
        bindCopy(layui.layer);
      });
    } else {
      bindCopy(null);
    }
  }

  function bindCopy(layer) {
    $$('[data-copy]').forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var text = btn.getAttribute('data-copy') || '';
        copyText(text, function (ok) {
          if (layer && layer.msg) {
            layer.msg(ok ? '命令已复制' : '复制失败，请手动选择', { icon: ok ? 1 : 2, time: 1600 });
          }
        });
      });
    });
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          done(true);
        },
        function () {
          fallbackCopy(text, done);
        }
      );
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      done(document.execCommand('copy'));
    } catch (error) {
      done(false);
    }
    document.body.removeChild(textarea);
  }

  function boot() {
    initNav();
    initHome();
    initPackagesPage();
    initPackageDetail();
    initProjectsPage();
    initProjectDetail();

    if (window.layui && layui.use) {
      layui.use('layer', function () {
        bindCopy(layui.layer);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
