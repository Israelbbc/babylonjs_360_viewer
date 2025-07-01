<?php

namespace Drupal\babylonjs_360_viewer\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\file\Plugin\Field\FieldFormatter\FileFormatterBase;
use Drupal\file\Entity\File;

/**
 * Plugin implementation of the 'babylonjs_360_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "babylonjs_360_formatter",
 *   label = @Translation("INAH BabylonJS 360 Viewer"),
 *   field_types = {
 *     "file"
 *   }
 * )
 */
class BabylonJS360Formatter extends FileFormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];

    $files = $this->getEntitiesToView($items, $langcode);
    if (empty($files)) {
      return $elements;
    }

    // Tomar el primer archivo solamente.
    $file = reset($files);
    $file_url = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
    $mime = $file->getMimeType();
    $type = str_starts_with($mime, 'video/') ? 'video' : 'photo';

    $elements[] = [
      '#theme' => 'babylonjs_360_viewer',
      '#file_url' => $file_url,
      '#type' => $type,
      '#create_placeholder' => FALSE,
      '#cache' => ['max-age' => 0],
      '#attached' => [
        'library' => [
          'babylonjs_360_viewer/babylonjs_360_viewer',
        ],
        'drupalSettings' => [
          'babylonjs_360_viewer' => [
            'file_url' => $file_url,
            'type' => $type,
          ],
        ],
      ],
    ];

    return $elements;
  }
}

