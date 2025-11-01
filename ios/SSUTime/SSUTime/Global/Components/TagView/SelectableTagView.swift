//
//  SelectableTagView.swift
//  SSUTime
//
//  Created by 성현주 on 11/1/25.
//

import UIKit
import SnapKit

final class SelectableTagView: UIView {

    // MARK: - Public Properties
    var onSelectionChanged: (([String]) -> Void)?

    // MARK: - Private Properties
    private var tags: [String] = []
    private var selectedItems: Set<String> = []

    // MARK: - UI
    private lazy var collectionView: UICollectionView = {
        let layout = LeftAlignedFlowLayout()
        layout.minimumLineSpacing = 10
        layout.minimumInteritemSpacing = 8
        layout.scrollDirection = .vertical

        let cv = UICollectionView(frame: .zero, collectionViewLayout: layout)
        cv.backgroundColor = .clear
        cv.register(TagCell.self, forCellWithReuseIdentifier: TagCell.id)
        cv.delegate = self
        cv.dataSource = self
        cv.isScrollEnabled = false
        return cv
    }()

    private var heightConstraint: Constraint?

    // MARK: - Init
    init(tags: [String]) {
        super.init(frame: .zero)
        self.tags = tags
        setupUI()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupUI()
    }

    private func setupUI() {
        addSubview(collectionView)
        collectionView.snp.makeConstraints {
            $0.edges.equalToSuperview()
            heightConstraint = $0.height.equalTo(1).constraint // 동적 업데이트용
        }
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        let height = collectionView.collectionViewLayout.collectionViewContentSize.height
        heightConstraint?.update(offset: height)
    }

    // MARK: - Public Methods
    func configure(with tags: [String]) {
        self.tags = tags
        selectedItems.removeAll()
        collectionView.reloadData()
        layoutIfNeeded()
    }

    func getSelectedTags() -> [String] {
        Array(selectedItems)
    }

    func setSelectedTags(_ tags: [String]) {
        selectedItems = Set(tags)
        collectionView.reloadData()
    }
}

// MARK: - UICollectionView Delegate & DataSource
extension SelectableTagView: UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout {
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return tags.count
    }

    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        guard let cell = collectionView.dequeueReusableCell(withReuseIdentifier: TagCell.id, for: indexPath) as? TagCell else {
            return UICollectionViewCell()
        }
        let tag = tags[indexPath.item]
        cell.configure(with: tag, isSelected: selectedItems.contains(tag))
        return cell
    }

    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let tag = tags[indexPath.item]
        if selectedItems.contains(tag) {
            selectedItems.remove(tag)
        } else {
            selectedItems.insert(tag)
        }

        collectionView.reloadData()
        onSelectionChanged?(Array(selectedItems))
    }

    func collectionView(_ collectionView: UICollectionView,
                        layout collectionViewLayout: UICollectionViewLayout,
                        sizeForItemAt indexPath: IndexPath) -> CGSize {
        let title = tags[indexPath.item]
        let width = (title as NSString).size(withAttributes: [
            .font: UIFont.systemFont(ofSize: 14, weight: .medium)
        ]).width + 32
        return CGSize(width: width, height: 34)
    }

    func collectionView(_ collectionView: UICollectionView,
                        layout collectionViewLayout: UICollectionViewLayout,
                        insetForSectionAt section: Int) -> UIEdgeInsets {
        .init(top: 0, left: 0, bottom: 0, right: 0)
    }
}
